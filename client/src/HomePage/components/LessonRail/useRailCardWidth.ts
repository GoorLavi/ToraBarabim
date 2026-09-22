import { useEffect } from 'react';
import type { RefObject } from 'react';
import { useTheme } from 'styled-components';

import { RAIL_CARD_WIDTH_DESKTOP, RAIL_CARD_WIDTH_MIN, RAIL_CARD_WIDTH_PROPERTY } from './consts';
import { idealRailCardWidth } from './helpers';

const CARD_WIDTH_MIN_PX = Number.parseInt(RAIL_CARD_WIDTH_MIN, 10);
const CARD_WIDTH_MAX_PX = Number.parseInt(RAIL_CARD_WIDTH_DESKTOP, 10);

// Measures the scroller's own scrolling container (the same element
// useScrollEdges and useRailScrollTracking already ref) and writes the
// result to a CSS custom property on it, read by styles.ts's `flex-basis`
// from `md` up. Written with `style.setProperty`, not a styled-components
// interpolation: the value changes on every resize, and an interpolated
// value would mint a new class each time instead of updating the existing
// one in place.
export const useRailCardWidth = (containerRef: RefObject<HTMLElement | null>): void => {
  const theme = useTheme();
  const gap = Number.parseInt(theme.spacing.sm, 10);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      const width = idealRailCardWidth(entry.contentRect.width, CARD_WIDTH_MIN_PX, CARD_WIDTH_MAX_PX, gap);
      element.style.setProperty(RAIL_CARD_WIDTH_PROPERTY, `${width}px`);
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [containerRef, gap]);
};
