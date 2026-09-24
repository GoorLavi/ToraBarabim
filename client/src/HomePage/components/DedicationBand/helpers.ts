import { DEDICATION_BAND_EDGE_PADDING_PX, DEDICATION_UNIT_GAP_PX, PRESS_MAX_TRAVEL_PX } from './consts';

// No unit-count threshold: a count is the wrong shape, since three units
// fill a phone and do not fill 1280, and this one comparison is correct at
// every viewport by construction. Callers pass the one real track's width,
// never the loop's duplicate.
export const isTrackOverflowing = (trackWidthPx: number, containerWidthPx: number): boolean => trackWidthPx > containerWidthPx;

// One real track's content plus the one gap `.viewport`'s own flex layout
// puts between it and its looped duplicate (styles.ts: the edge padding
// that used to sit on `.track` itself moved to `.viewport`, so it no
// longer inflates `track.scrollWidth`). This, not `track.scrollWidth`
// alone, is the period the loop actually repeats at: the distance from one
// copy's first unit to the next copy's first unit is the real track's own
// width plus this one seam gap.
export const loopPeriodPx = (trackWidthPx: number): number => trackWidthPx + DEDICATION_UNIT_GAP_PX;

// Keeps a position within one loop period of the origin, which is what
// makes the loop's duplicated track seamless: the strip repeats exactly
// every `periodPx`, so jumping by a whole period never changes what is
// visually on screen. Advancing past the seam and stepping back across it
// both land on the position this returns for the unwrapped value, in both
// directions. A true modulo, not a single subtract-or-add: a position more
// than one period out of range (a resumed tab's first frame, before the
// delta cap below existed, jumped by however long it had been backgrounded)
// has to come back in range regardless of how many periods away it started.
export const wrapTrackPosition = (position: number, periodPx: number): number => {
  if (periodPx <= 0) return position;
  const remainder = position % periodPx;
  return remainder < 0 ? remainder + periodPx : remainder;
};

// One arrow-key step: exactly one unit pitch, never a pixel amount, so a
// keyboard user never lands mid-name. Rounds the current position to the
// nearest pitch multiple before stepping, rather than adding the pitch to
// whatever fractional position the crawl happened to freeze at: without
// this, every step preserves that same fractional offset instead of
// landing on a unit boundary, drifting further from alignment with every
// press.
export const stepByUnitPitch = (position: number, direction: 1 | -1, unitPitchPx: number): number =>
  (Math.round(position / unitPitchPx) + direction) * unitPitchPx;

// How much of `viewport.clientWidth` the edge framing (now on `.viewport`
// itself, styles.ts) takes up on both sides together, so the overflow test
// compares the track's real content width against the width actually
// available to it, not the viewport's raw box.
export const availableTrackWidthPx = (viewportClientWidthPx: number): number =>
  viewportClientWidthPx - 2 * DEDICATION_BAND_EDGE_PADDING_PX;

// Press versus drag: the straight-line distance the pointer travelled,
// strictly under PRESS_MAX_TRAVEL_PX, per the design rule ("the pointer
// travels less than 10px"). Not a per-axis check: that would let a diagonal
// move of up to about 14px (10 on each axis) through as a press.
export const isPressGesture = (deltaXPx: number, deltaYPx: number): boolean => Math.hypot(deltaXPx, deltaYPx) < PRESS_MAX_TRAVEL_PX;
