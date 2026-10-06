import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

import { isUserBusy } from '../../helpers';
import { DISTANCE_PROPERTY, PROGRESS_PROPERTY, PULL_THRESHOLD_PX } from './consts';
import { gestureAxisFor, pullDistanceFor, pullProgressFor, pullStatusFor } from './helpers';
import type { PullGesture, PullStatus, UsePullToRefreshOptions } from './models';

// A scrolled inner container owns the drag: pulling while a rail's column or a
// list is mid-scroll would fight it.
const hasScrolledAncestor = (target: EventTarget | null): boolean => {
  let node = target instanceof Element ? target : null;
  while (node && node !== document.documentElement) {
    if (node.scrollTop > 0) return true;
    node = node.parentElement;
  }
  return false;
};

// Listens on the document for a downward drag that starts at the very top of
// the page, and reports the discrete status. The distance itself is written
// straight onto the indicator as a CSS variable, so a drag does not render
// React on every touch move.
export const usePullToRefresh = ({ isActive, onRefresh }: UsePullToRefreshOptions): { status: PullStatus; indicatorRef: RefObject<HTMLDivElement | null> } => {
  const [status, setStatus] = useState<PullStatus>('idle');
  const indicatorRef = useRef<HTMLDivElement>(null);
  const latestOnRefresh = useRef(onRefresh);

  useEffect(() => {
    latestOnRefresh.current = onRefresh;
  });

  useEffect(() => {
    if (!isActive) return;

    let gesture: PullGesture = { phase: 'none' };
    let isRefreshing = false;

    const showDistance = (distance: number): void => {
      indicatorRef.current?.style.setProperty(DISTANCE_PROPERTY, `${distance}px`);
      indicatorRef.current?.style.setProperty(PROGRESS_PROPERTY, String(pullProgressFor(distance)));
    };

    // The one way a locked pull ends without a refresh: the indicator goes
    // back to the edge and the status to idle, whatever dropped it.
    const dropPull = (): void => {
      gesture = { phase: 'none' };
      showDistance(0);
      setStatus('idle');
    };

    const handleTouchStart = (event: TouchEvent): void => {
      if (gesture.phase === 'pulling') dropPull();
      gesture = { phase: 'none' };
      if (isRefreshing || event.touches.length !== 1) return;
      if (window.scrollY > 0 || hasScrolledAncestor(event.target) || isUserBusy(document)) return;

      const touch = event.touches[0];
      if (!touch) return;
      gesture = { phase: 'undecided', startX: touch.clientX, startY: touch.clientY };
    };

    const handleTouchMove = (event: TouchEvent): void => {
      if (gesture.phase === 'none') return;
      const touch = event.touches[0];
      if (!touch || event.touches.length !== 1) {
        dropPull();
        return;
      }

      if (gesture.phase === 'undecided') {
        const deltaY = touch.clientY - gesture.startY;
        const axis = gestureAxisFor(touch.clientX - gesture.startX, deltaY);
        if (axis === undefined) return;
        // Horizontal belongs to the rails, upward to ordinary scrolling.
        if (axis === 'horizontal' || deltaY < 0) {
          gesture = { phase: 'none' };
          return;
        }
        gesture = { phase: 'pulling', startY: gesture.startY, distance: 0 };
      }

      // A pull that turns back above where it started is a scroll now.
      const fingerTravel = touch.clientY - gesture.startY;
      if (fingerTravel <= 0) {
        dropPull();
        return;
      }

      const distance = pullDistanceFor(fingerTravel);
      gesture = { ...gesture, distance };
      showDistance(distance);
      setStatus(pullStatusFor(distance));
    };

    // A cancelled touch (a call, a system gesture) never refreshes: the
    // person did not release.
    const finishGesture = (isReleased: boolean): void => {
      if (gesture.phase !== 'pulling') {
        gesture = { phase: 'none' };
        return;
      }

      const { distance } = gesture;
      gesture = { phase: 'none' };

      if (isReleased && distance >= PULL_THRESHOLD_PX) {
        isRefreshing = true;
        showDistance(PULL_THRESHOLD_PX);
        setStatus('refreshing');
        latestOnRefresh.current();
        return;
      }

      dropPull();
    };

    // Every listener is passive: the browser's own bounce is switched off in
    // the global style (overscroll-behavior in GlobalStyle.ts), so nothing here
    // ever needs to cancel a touch.
    const handleTouchEnd = (): void => finishGesture(true);
    const handleTouchCancel = (): void => finishGesture(false);

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('touchcancel', handleTouchCancel, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [isActive]);

  return { status, indicatorRef };
};
