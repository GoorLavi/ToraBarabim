import { useSyncExternalStore } from 'react';

// rAF-throttled so the header's shadow and the pinned bar's visibility
// recompute at most once per frame instead of once per scroll event.
const subscribe = (onStoreChange: () => void): (() => void) => {
  let frame = 0;

  const handleScroll = (): void => {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      onStoreChange();
      frame = 0;
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  return () => {
    window.removeEventListener('scroll', handleScroll);
    if (frame) window.cancelAnimationFrame(frame);
  };
};

const getSnapshot = (): number => window.scrollY;

// Before hydration there is no scroll position yet, so the honest starting
// value is the top of the page.
const getServerSnapshot = (): number => 0;

export const useScrollY = (): number => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
