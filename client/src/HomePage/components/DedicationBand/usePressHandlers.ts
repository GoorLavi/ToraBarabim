import { useRef, useState } from 'react';
import type { MouseEvent, PointerEvent } from 'react';

import type { PressHandlers, PressStartPoint } from './models';
import { isPressGesture } from './helpers';

// Press-versus-drag detection for the band as a whole, wired onto the
// `<section>` that wraps the crawl's own `.viewport` (DedicationBand.tsx):
// both hooks' pointer handlers see the same bubbling events, since neither
// calls `stopPropagation`.
//
// `onPointerUp` only records whether the gesture was a press; `onClick` is
// what actually opens. Opening on `pointerup` itself mounts the scrim under
// a finger still on the screen, and the tap's own follow-up `click` then
// lands on that scrim and closes what it just opened; a tap that stops a
// page fling fires `pointerdown`/`pointerup` with no travel but has its
// `click` suppressed by the browser, so keying off `pointerup` would open
// the window for a gesture that was never meant to. `event.detail === 0`
// always counts too: a keyboard `Enter`/`Space` activation of the
// invitation button bubbles up as a `click` with no pointer event at all.
export const usePressHandlers = (onPress: () => void): PressHandlers => {
  const startRef = useRef<PressStartPoint | null>(null);
  const wasPressRef = useRef(false);
  const hasLeftPressRangeRef = useRef(false);
  const [isDraggingPastThreshold, setIsDraggingPastThreshold] = useState(false);

  const onPointerDown = (event: PointerEvent<HTMLElement>): void => {
    if (!event.isPrimary) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    startRef.current = { x: event.clientX, y: event.clientY };
    wasPressRef.current = false;
    hasLeftPressRangeRef.current = false;
    setIsDraggingPastThreshold(false);
  };

  const onPointerMove = (event: PointerEvent<HTMLElement>): void => {
    if (!event.isPrimary) return;
    const start = startRef.current;
    if (!start || isPressGesture(event.clientX - start.x, event.clientY - start.y)) return;
    hasLeftPressRangeRef.current = true;
    setIsDraggingPastThreshold(true);
  };

  // A gesture that once travelled past the threshold stays a drag, even if it
  // ends back near where it started.
  const onPointerUp = (event: PointerEvent<HTMLElement>): void => {
    if (!event.isPrimary) return;
    const start = startRef.current;
    wasPressRef.current =
      start !== null && !hasLeftPressRangeRef.current && isPressGesture(event.clientX - start.x, event.clientY - start.y);
    startRef.current = null;
    setIsDraggingPastThreshold(false);
  };

  const onPointerCancel = (event: PointerEvent<HTMLElement>): void => {
    if (!event.isPrimary) return;
    startRef.current = null;
    wasPressRef.current = false;
    setIsDraggingPastThreshold(false);
  };

  const onClick = (event: MouseEvent<HTMLElement>): void => {
    const shouldOpen = wasPressRef.current || event.detail === 0;
    wasPressRef.current = false;
    if (shouldOpen) onPress();
  };

  return { isDraggingPastThreshold, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onClick };
};
