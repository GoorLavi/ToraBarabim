import { useEffect, useState } from 'react';

// rAF-throttled so the header's shadow and the pinned bar's visibility
// recompute at most once per frame instead of once per scroll event.
export const useScrollY = (): number => {
  const [scrollY, setScrollY] = useState(() => window.scrollY);

  useEffect(() => {
    let frame = 0;

    const handleScroll = (): void => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        frame = 0;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return scrollY;
};
