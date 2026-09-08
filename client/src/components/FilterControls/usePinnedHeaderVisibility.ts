import type { RefObject } from 'react';
import { useEffect, useState } from 'react';
import { useTheme } from 'styled-components';

import * as consts from './consts';

const parsePx = (value: string): number => Number.parseInt(value, 10);

// The pinned bar is a `lg`-and-below concern only: at `lg` and up the
// header is sticky instead and never collapses.
const useIsBelowLg = (): boolean => {
  const theme = useTheme();
  const query = `(max-width: calc(${theme.breakpoints.lg} - 1px))`;
  const [isBelowLg, setIsBelowLg] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const handleChange = (event: MediaQueryListEvent): void => setIsBelowLg(event.matches);

    setIsBelowLg(mediaQueryList.matches);
    mediaQueryList.addEventListener('change', handleChange);
    return () => mediaQueryList.removeEventListener('change', handleChange);
  }, [query]);

  return isBelowLg;
};

// Only meaningful when `ResizeObserver` is unavailable: the header's own
// hand-measured height at each range, keyed off the same `md` boundary the
// rest of the header uses.
const useFallbackHeaderHeight = (): number => {
  const theme = useTheme();
  const query = `(min-width: ${theme.breakpoints.md})`;
  const [isAtLeastMd, setIsAtLeastMd] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const handleChange = (event: MediaQueryListEvent): void => setIsAtLeastMd(event.matches);

    setIsAtLeastMd(mediaQueryList.matches);
    mediaQueryList.addEventListener('change', handleChange);
    return () => mediaQueryList.removeEventListener('change', handleChange);
  }, [query]);

  return isAtLeastMd ? consts.FALLBACK_HEADER_HEIGHT_TABLET_PX : consts.FALLBACK_HEADER_HEIGHT_PHONE_PX;
};

// The chip row can wrap, changing the full header's own height, so the
// threshold is measured off the rendered element rather than assumed.
const useHeaderHeight = (headerRef: RefObject<HTMLElement | null>, fallbackPx: number): number => {
  const [height, setHeight] = useState(fallbackPx);

  useEffect(() => {
    const element = headerRef.current;
    if (!element || typeof ResizeObserver === 'undefined') {
      setHeight(fallbackPx);
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      if (entry) setHeight(entry.borderBoxSize[0]?.blockSize ?? entry.contentRect.height);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [headerRef, fallbackPx]);

  return height;
};

// Shows once the full header has completely scrolled past, hides again
// only once scrolled back up `PINNED_BAR_HYSTERESIS_PX` further, so a thumb
// resting near the boundary does not flap the bar in and out. The two are
// never both visible: showing happens exactly where the header ends.
export const usePinnedHeaderVisibility = (headerRef: RefObject<HTMLElement | null>, scrollY: number): boolean => {
  const isBelowLg = useIsBelowLg();
  const fallbackHeight = useFallbackHeaderHeight();
  const headerHeight = useHeaderHeight(headerRef, fallbackHeight);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isBelowLg) {
      setIsVisible(false);
      return;
    }
    if (scrollY >= headerHeight) {
      setIsVisible(true);
    } else if (scrollY <= headerHeight - consts.PINNED_BAR_HYSTERESIS_PX) {
      setIsVisible(false);
    }
  }, [isBelowLg, scrollY, headerHeight]);

  return isVisible;
};
