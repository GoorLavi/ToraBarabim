import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

import { SCROLL_SETTLE_MS } from './consts';

export interface VisibleSlideTracking {
  visibleIndex: number;
  // Called right before a `goTo`-triggered `scrollIntoView`, with the same
  // index just requested: sets `visibleIndex` to that destination right
  // away and freezes it there until the scroll settles, so a fast second
  // arrow tap computes its target from the destination just requested,
  // never a slide only passed through mid-scroll (design gate round 5
  // finding).
  freezeUntilSettled: (target: number) => void;
}

// Tracks which slide is most visible inside the phone strip's own
// horizontal, snap-aligned scroller, through `IntersectionObserver` rather
// than reading `scrollLeft`: browsers disagree on its sign and origin
// inside a `direction: rtl` container (`Rail/helpers.ts`'s own
// `railScrollMetrics` works around the same disagreement for the rail's
// continuous scroll), while intersection is direction-agnostic. `slideCount`
// is read only to re-observe when the slides themselves change (`slideRefs`
// is a ref, stable across renders on its own).
export const useVisibleSlideIndex = (
  containerRef: RefObject<HTMLElement | null>,
  slideRefs: RefObject<(HTMLElement | null)[]>,
  slideCount: number,
): VisibleSlideTracking => {
  const [visibleIndex, setVisibleIndex] = useState(0);
  const ratiosRef = useRef<Map<Element, number>>(new Map());
  const frozenRef = useRef(false);
  const settleTimerRef = useRef<number | undefined>(undefined);
  const scheduleUnfreezeRef = useRef<() => void>(() => {});

  const freezeUntilSettled = (target: number): void => {
    frozenRef.current = true;
    setVisibleIndex(target);
    scheduleUnfreezeRef.current();
  };

  useEffect(() => {
    const container = containerRef.current;
    const slides = slideRefs.current.filter((slide): slide is HTMLElement => slide !== null);
    if (!container || slides.length === 0) return;

    ratiosRef.current = new Map(slides.map((slide) => [slide, 0]));

    // The most visible slide by the ratios the observer has recorded so
    // far, including the ones a freeze skipped acting on: undefined when
    // every recorded ratio is still 0, a transient mid-scroll state, not
    // "the first slide is now visible" (design gate round 4, reviewer M1).
    const mostVisibleIndex = (): number | undefined => {
      let bestSlide: HTMLElement | undefined;
      let bestRatio = 0;
      for (const slide of slides) {
        const ratio = ratiosRef.current.get(slide) ?? 0;
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestSlide = slide;
        }
      }
      if (!bestSlide) return undefined;
      const index = slides.indexOf(bestSlide);
      return index === -1 ? undefined : index;
    };

    const scheduleUnfreeze = (): void => {
      window.clearTimeout(settleTimerRef.current);
      settleTimerRef.current = window.setTimeout(() => {
        frozenRef.current = false;
        // Re-picks from the ratios the observer kept recording while
        // frozen: no further observer callback is guaranteed once the
        // scroll has already stopped, so nothing else would ever move the
        // tracker off the frozen target once it lifts.
        const index = mostVisibleIndex();
        if (index !== undefined) setVisibleIndex(index);
      }, SCROLL_SETTLE_MS);
    };
    scheduleUnfreezeRef.current = scheduleUnfreeze;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) ratiosRef.current.set(entry.target, entry.intersectionRatio);
        if (frozenRef.current) return;
        const index = mostVisibleIndex();
        if (index !== undefined) setVisibleIndex(index);
      },
      { root: container, threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    for (const slide of slides) observer.observe(slide);

    // Extends the freeze through a `goTo` scroll's own full travel, the
    // same settle-on-the-last-event technique `Rail/useRailScrollTracking.ts`
    // already uses for its own scroll-burst concern: harmless to run during
    // an ordinary swipe too, since `frozenRef` only ever starts true from
    // `freezeUntilSettled` above.
    container.addEventListener('scroll', scheduleUnfreeze, { passive: true });

    return () => {
      observer.disconnect();
      container.removeEventListener('scroll', scheduleUnfreeze);
      window.clearTimeout(settleTimerRef.current);
    };
  }, [containerRef, slideRefs, slideCount]);

  return { visibleIndex, freezeUntilSettled };
};
