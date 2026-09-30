import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';

import { RAIL_SCROLL_MIN_DELTA, RAIL_SCROLL_SETTLE_MS } from './consts';

// One `Rail Scroll` event per gesture burst, covering both the prev/next
// arrows (`scrollRailBy`'s smooth scroll) and a touch swipe: both fire many
// native `scroll` events, so this waits for a settle window after the last
// one rather than reacting to each. Direction comes from the change in
// `Math.abs(scrollLeft)` between the first `scroll` event this gesture
// produced (which already reflects some travel, not the true origin) and
// the last one before the settle window closes, the same RTL-safe
// distance-from-start `railScrollEdges` (helpers.ts) already uses, never
// from the raw sign of `scrollLeft`, which browsers disagree on in a
// right-to-left page. The 24px floor (`RAIL_SCROLL_MIN_DELTA`) makes that
// understated start harmless in practice.
export const useRailScrollTracking = (scrollerRef: RefObject<HTMLElement | null>, railTitle: string): void => {
  const railTitleRef = useRef(railTitle);
  railTitleRef.current = railTitle;

  useEffect(() => {
    const element = scrollerRef.current;
    if (!element) return;

    let settleTimer: number | undefined;
    let gestureStartDistance: number | null = null;

    const handleScroll = (): void => {
      const distance = Math.abs(element.scrollLeft);
      if (gestureStartDistance === null) gestureStartDistance = distance;

      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        const startDistance = gestureStartDistance ?? distance;
        const delta = distance - startDistance;
        gestureStartDistance = null;

        if (Math.abs(delta) < RAIL_SCROLL_MIN_DELTA) return;
        trackEvent(MIXPANEL_EVENTS.railScroll, { railTitle: railTitleRef.current, direction: delta > 0 ? 'next' : 'prev' });
      }, RAIL_SCROLL_SETTLE_MS);
    };

    element.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      element.removeEventListener('scroll', handleScroll);
      window.clearTimeout(settleTimer);
    };
  }, [scrollerRef]);
};
