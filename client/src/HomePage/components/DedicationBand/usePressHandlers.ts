import { useRef, useState } from 'react';
import type { PointerEvent } from 'react';

import { isPressGesture } from './helpers';

export interface PressHandlers {
  // Exposed so the band can switch its own cursor to "grabbing" only once a
  // drag actually clears the press threshold (designer decisions: cursor is
  // "pointer" at rest and on hover, "grabbing" only past the 10px bar),
  // rather than the instant a mouse goes down the way the crawl's own
  // `isDragging` does.
  isDraggingPastThreshold: boolean;
  onPointerDown: (event: PointerEvent<HTMLElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLElement>) => void;
  onPointerCancel: () => void;
}

// Press-versus-drag detection for the band as a whole, wired onto the
// `<section>` that wraps the crawl's own `.viewport` (DedicationBand.tsx).
// Both sets of pointer handlers see the same bubbling events, since
// `.viewport` is this element's own child and neither this hook nor
// `useDedicationCrawl` ever calls `stopPropagation`, so a press or a drag
// that starts on the crawling viewport itself is still seen here.
// `pointercancel` (a touch scroll taking over) clears the start position
// without ever calling `onPress`, per the design rule's own first point.
export const usePressHandlers = (onPress: () => void): PressHandlers => {
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const [isDraggingPastThreshold, setIsDraggingPastThreshold] = useState(false);

  const clear = (): void => {
    startRef.current = null;
    setIsDraggingPastThreshold(false);
  };

  // A mouse's secondary or auxiliary button never starts a press; every
  // touch or pen point does, since neither carries a meaningful `button`
  // value the way a mouse does.
  const onPointerDown = (event: PointerEvent<HTMLElement>): void => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    startRef.current = { x: event.clientX, y: event.clientY };
  };

  const onPointerMove = (event: PointerEvent<HTMLElement>): void => {
    const start = startRef.current;
    if (!start) return;
    if (!isPressGesture(event.clientX - start.x, event.clientY - start.y)) setIsDraggingPastThreshold(true);
  };

  const onPointerUp = (event: PointerEvent<HTMLElement>): void => {
    const start = startRef.current;
    const wasPress = start !== null && isPressGesture(event.clientX - start.x, event.clientY - start.y);
    clear();
    if (wasPress) onPress();
  };

  return { isDraggingPastThreshold, onPointerDown, onPointerMove, onPointerUp, onPointerCancel: clear };
};
