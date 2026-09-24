import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent, RefObject } from 'react';

import { CRAWL_SPEED_PX_PER_SECOND, DEDICATION_UNIT_PITCH_PX, MAX_FRAME_DELTA_SECONDS, RESUME_AFTER_INTERACTION_MS } from './consts';
import { availableTrackWidthPx, isTrackOverflowing, loopPeriodPx, stepByUnitPitch, wrapTrackPosition } from './helpers';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export interface DedicationCrawlHandlers {
  viewportRef: RefObject<HTMLDivElement | null>;
  trackRef: RefObject<HTMLDivElement | null>;
  isOverflowing: boolean;
  isDragging: boolean;
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerCancel: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerEnter: (event: PointerEvent<HTMLDivElement>) => void;
  onPointerLeave: (event: PointerEvent<HTMLDivElement>) => void;
  onFocus: () => void;
  onBlur: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
}

// `scrollLeft`'s sign in a `direction: rtl` container is not consistent
// enough to assign directly (mirrors LessonRail/helpers.ts, scrollRailBy):
// reading the computed direction rather than assuming a sign is what this
// codebase already does at the one other place that moves a rail's scroll
// position from code.
const rtlSignOf = (element: HTMLElement): 1 | -1 => (getComputedStyle(element).direction === 'rtl' ? -1 : 1);

// Owns every effect the crawling band needs: the frame loop, the resize
// measurement, the resume timer and the visibility listener, each with its
// own cleanup (design-system.md, dedication States: "Every effect cleans
// up"). Returns refs and event handlers; the component owns the markup.
export const useDedicationCrawl = (): DedicationCrawlHandlers => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Ref-backed, not state: these are read once per animation frame and
  // written from high-frequency pointer events, neither of which should
  // trigger a re-render.
  const isHoveringRef = useRef(false);
  const isFocusedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const isCoolingDownRef = useRef(false);
  const isHiddenRef = useRef(typeof document === 'undefined' ? false : document.hidden);
  const prefersReducedMotionRef = useRef(false);
  const resumeTimeoutRef = useRef<number | undefined>(undefined);
  const dragStartClientXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);
  // The frame loop's own continuous position, in the same unsigned space
  // `wrapTrackPosition` works in. Advanced and read here only, never
  // derived from `scrollLeft` while the loop keeps advancing frame after
  // frame: `scrollLeft`'s setter rounds to a whole pixel, so reading the
  // rounded value back and adding a sub-pixel-per-frame amount rounds up
  // by a full pixel on every single frame regardless of the real elapsed
  // time, which is what turned a 32px/s crawl into 60px/s at 60Hz and
  // 120px/s at 120Hz (measured on a real device). Resynced from the actual
  // `scrollLeft` only at the first frame after advancing (re)starts, which
  // is what still lets a native touch scroll (never routed through this
  // hook's own handlers, since the browser moves `scrollLeft` for a touch
  // drag on its own) be the position the crawl resumes from, per rule 1.
  const scrollPositionRef = useRef(0);
  const wasAdvancingRef = useRef(false);

  // The resize measurement: watches the one real track, never the loop's
  // duplicate, so a name that reflows when Frank Ruhl Libre arrives
  // (`display=swap`) is caught the same way a window resize is.
  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const measure = (): void => setIsOverflowing(isTrackOverflowing(track.scrollWidth, availableTrackWidthPx(viewport.clientWidth)));
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(track);
    return () => observer.disconnect();
  }, []);

  // The visibility listener: stop advancing when the tab is hidden, per
  // rule 7, checked by the frame loop below rather than by tearing the
  // loop down and rebuilding it on every visibility change.
  useEffect(() => {
    const handleVisibilityChange = (): void => {
      isHiddenRef.current = document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    const query = window.matchMedia(REDUCED_MOTION_QUERY);
    prefersReducedMotionRef.current = query.matches;
    const handleChange = (): void => {
      prefersReducedMotionRef.current = query.matches;
    };
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, []);

  // Cancels a pending resume timeout on unmount, so a reader who leaves the
  // page mid-cooldown never leaves a timer running against an unmounted
  // component.
  useEffect(() => () => window.clearTimeout(resumeTimeoutRef.current), []);

  const scheduleResume = (): void => {
    window.clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = window.setTimeout(() => {
      isCoolingDownRef.current = false;
    }, RESUME_AFTER_INTERACTION_MS);
  };

  // The frame loop. Never a CSS transform animation: a scroll container
  // advanced per frame keeps manual scrolling, wrapping, resume-from-
  // position and keyboard stepping all native. Reduced motion never starts
  // this loop's advance, but the container stays scrollable regardless
  // (rule 6): that guarantee lives in the markup and the pointer/keyboard
  // handlers below, not here.
  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track || !isOverflowing) return;

    const rtlSign = rtlSignOf(viewport);
    let frameId: number;
    let lastTimestampMs: number | undefined;
    wasAdvancingRef.current = false;

    const step = (timestampMs: number): void => {
      frameId = requestAnimationFrame(step);

      if (lastTimestampMs === undefined) {
        lastTimestampMs = timestampMs;
        return;
      }
      // Capped, not the raw elapsed time: a backgrounded tab's first frame
      // back delivers a huge real delta, and advancing by the whole paused
      // duration would jump the crawl many loop periods forward at once.
      const deltaSeconds = Math.min((timestampMs - lastTimestampMs) / 1000, MAX_FRAME_DELTA_SECONDS);
      lastTimestampMs = timestampMs;

      const shouldAdvance =
        !isHiddenRef.current &&
        !prefersReducedMotionRef.current &&
        !isHoveringRef.current &&
        !isFocusedRef.current &&
        !isDraggingRef.current &&
        !isCoolingDownRef.current;
      if (!shouldAdvance) {
        wasAdvancingRef.current = false;
        return;
      }

      if (!wasAdvancingRef.current) {
        scrollPositionRef.current = viewport.scrollLeft * rtlSign;
        wasAdvancingRef.current = true;
      }

      const nextPosition = wrapTrackPosition(scrollPositionRef.current + CRAWL_SPEED_PX_PER_SECOND * deltaSeconds, loopPeriodPx(track.scrollWidth));
      scrollPositionRef.current = nextPosition;
      viewport.scrollLeft = nextPosition * rtlSign;
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [isOverflowing]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>): void => {
    isDraggingRef.current = true;
    setIsDragging(true);
    window.clearTimeout(resumeTimeoutRef.current);
    isCoolingDownRef.current = false;

    // Touch and pen already scroll natively once `.overflowing` sets
    // `overflow-x: auto`; only a mouse needs a manual drag-to-scroll,
    // since a mouse has no native click-and-drag scroll gesture.
    if (event.pointerType !== 'mouse') return;

    const viewport = viewportRef.current;
    if (!viewport) return;
    dragStartClientXRef.current = event.clientX;
    dragStartScrollLeftRef.current = viewport.scrollLeft;
    viewport.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>): void => {
    if (!isDraggingRef.current || event.pointerType !== 'mouse') return;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const rtlSign = rtlSignOf(viewport);
    const deltaClientX = event.clientX - dragStartClientXRef.current;
    const rawPosition = (dragStartScrollLeftRef.current - deltaClientX) * rtlSign;
    const wrapped = wrapTrackPosition(rawPosition, loopPeriodPx(track.scrollWidth));
    viewport.scrollLeft = wrapped * rtlSign;
  };

  // Rule 1: resume from wherever the reader left it, never snap back, so
  // this never touches `scrollLeft`. Rule 2's cooldown covers the touch
  // case, which has no hover to key off of.
  const endDrag = (event: PointerEvent<HTMLDivElement>): void => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    if (event.pointerType === 'mouse') viewportRef.current?.releasePointerCapture(event.pointerId);
    isCoolingDownRef.current = true;
    scheduleResume();
  };

  const onPointerEnter = (event: PointerEvent<HTMLDivElement>): void => {
    if (event.pointerType === 'mouse') isHoveringRef.current = true;
  };

  const onPointerLeave = (event: PointerEvent<HTMLDivElement>): void => {
    if (event.pointerType === 'mouse') isHoveringRef.current = false;
  };

  // Gated on `:focus-visible`, not on focus alone: a mouse click focuses
  // the viewport (it is `tabIndex={0}` for arrow-key stepping) exactly the
  // same as Tab does, but only Tab leaves `:focus-visible` true. Without
  // this a single click latches `isFocusedRef` and nothing but a `blur`
  // ever clears it, since there is no hover to end it with a mouse that
  // has moved away (measured: frozen well past the 4s cooldown, revived
  // only by blur).
  const onFocus = (): void => {
    isFocusedRef.current = viewportRef.current?.matches(':focus-visible') ?? false;
  };

  const onBlur = (): void => {
    isFocusedRef.current = false;
  };

  // Rule 5: exactly one unit pitch, never a pixel amount. Focus already
  // pauses the loop above, so this always moves a static band.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    event.preventDefault();

    const rtlSign = rtlSignOf(viewport);
    // Reading direction is right to left, so ArrowLeft steps toward the
    // end (forward) and ArrowRight steps toward the start (back).
    const direction = event.key === 'ArrowLeft' ? 1 : -1;
    const currentPosition = viewport.scrollLeft * rtlSign;
    const nextPosition = wrapTrackPosition(stepByUnitPitch(currentPosition, direction, DEDICATION_UNIT_PITCH_PX), loopPeriodPx(track.scrollWidth));
    viewport.scrollLeft = nextPosition * rtlSign;
  };

  return {
    viewportRef,
    trackRef,
    isOverflowing,
    isDragging,
    onPointerDown,
    onPointerMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
    onPointerEnter,
    onPointerLeave,
    onFocus,
    onBlur,
    onKeyDown,
  };
};
