import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

// Tracks which slide is most visible inside the phone strip's own
// horizontal, snap-aligned scroller, through `IntersectionObserver` rather
// than reading `scrollLeft`: browsers disagree on its sign and origin
// inside a `direction: rtl` container (`Rail/helpers.ts`'s own
// `railScrollMetrics` works around the same disagreement for the rail's
// continuous scroll), while intersection is direction-agnostic.
export const useVisibleSlideIndex = (containerRef: RefObject<HTMLElement | null>, slideRefs: RefObject<(HTMLElement | null)[]>): number => {
  const [visibleIndex, setVisibleIndex] = useState(0);
  const ratiosRef = useRef<Map<Element, number>>(new Map());

  useEffect(() => {
    const container = containerRef.current;
    const slides = slideRefs.current.filter((slide): slide is HTMLElement => slide !== null);
    if (!container || slides.length === 0) return;

    ratiosRef.current = new Map(slides.map((slide) => [slide, 0]));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) ratiosRef.current.set(entry.target, entry.intersectionRatio);

        let bestSlide: HTMLElement | undefined;
        let bestRatio = -1;
        for (const slide of slides) {
          const ratio = ratiosRef.current.get(slide) ?? 0;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestSlide = slide;
          }
        }

        const bestIndex = bestSlide ? slides.indexOf(bestSlide) : -1;
        if (bestIndex !== -1) setVisibleIndex(bestIndex);
      },
      { root: container, threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    for (const slide of slides) observer.observe(slide);
    return () => observer.disconnect();
  }, [containerRef, slideRefs]);

  return visibleIndex;
};
