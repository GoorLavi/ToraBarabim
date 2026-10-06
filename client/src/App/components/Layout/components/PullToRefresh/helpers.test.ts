import { describe, expect, it } from 'vitest';

import { MAX_PULL_PX, PULL_RESISTANCE, PULL_THRESHOLD_PX } from './consts';
import { gestureAxisFor, pullDistanceFor, pullProgressFor, pullStatusFor } from './helpers';

describe('pullDistanceFor', () => {
  it('is zero for no travel and for an upward drag', () => {
    expect(pullDistanceFor(0)).toBe(0);
    expect(pullDistanceFor(-40)).toBe(0);
  });

  it('resists: the indicator moves less than the finger', () => {
    expect(pullDistanceFor(100)).toBe(100 * PULL_RESISTANCE);
  });

  it('never exceeds the maximum however far the finger goes', () => {
    expect(pullDistanceFor(5000)).toBe(MAX_PULL_PX);
  });
});

describe('pullStatusFor', () => {
  it('is idle at the edge, pulling short of the threshold, ready at it and beyond', () => {
    expect(pullStatusFor(0)).toBe('idle');
    expect(pullStatusFor(PULL_THRESHOLD_PX - 1)).toBe('pulling');
    expect(pullStatusFor(PULL_THRESHOLD_PX)).toBe('ready');
    expect(pullStatusFor(MAX_PULL_PX)).toBe('ready');
  });
});

describe('pullProgressFor', () => {
  it('runs from 0 to 1 over the threshold and stays at 1 past it', () => {
    expect(pullProgressFor(0)).toBe(0);
    expect(pullProgressFor(PULL_THRESHOLD_PX / 2)).toBe(0.5);
    expect(pullProgressFor(MAX_PULL_PX)).toBe(1);
  });
});

describe('gestureAxisFor', () => {
  it('waits while the finger has barely moved', () => {
    expect(gestureAxisFor(3, 4)).toBeUndefined();
  });

  it('locks vertical on a clearly downward or upward drag', () => {
    expect(gestureAxisFor(2, 30)).toBe('vertical');
    expect(gestureAxisFor(-2, -30)).toBe('vertical');
  });

  it('locks horizontal on a sideways swipe, including a shallow diagonal', () => {
    expect(gestureAxisFor(40, 3)).toBe('horizontal');
    expect(gestureAxisFor(-40, 20)).toBe('horizontal');
  });
});
