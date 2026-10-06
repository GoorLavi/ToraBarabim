import { AXIS_LOCK_SLOP_PX, MAX_PULL_PX, PULL_RESISTANCE, PULL_THRESHOLD_PX } from './consts';
import type { GestureAxis, PullStatus } from './models';

// What the person sees for a given finger travel: resisted, and capped.
export const pullDistanceFor = (fingerTravelPx: number): number => {
  if (fingerTravelPx <= 0) return 0;
  return Math.min(fingerTravelPx * PULL_RESISTANCE, MAX_PULL_PX);
};

// 0 at the top edge, 1 at the threshold and beyond.
export const pullProgressFor = (distancePx: number): number => Math.min(Math.max(distancePx / PULL_THRESHOLD_PX, 0), 1);

export const pullStatusFor = (distancePx: number): Extract<PullStatus, 'idle' | 'pulling' | 'ready'> => {
  if (distancePx <= 0) return 'idle';
  return distancePx >= PULL_THRESHOLD_PX ? 'ready' : 'pulling';
};

// `undefined` until the finger has moved clearly in one direction. Vertical
// wins only when it dominates, so a diagonal swipe along a rail is horizontal.
export const gestureAxisFor = (deltaX: number, deltaY: number): GestureAxis | undefined => {
  const travelX = Math.abs(deltaX);
  const travelY = Math.abs(deltaY);
  if (Math.max(travelX, travelY) < AXIS_LOCK_SLOP_PX) return undefined;
  return travelY > travelX ? 'vertical' : 'horizontal';
};
