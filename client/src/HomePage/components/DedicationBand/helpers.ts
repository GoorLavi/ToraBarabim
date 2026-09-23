// The width test: crawl when the track (one copy, never the loop's
// `aria-hidden` duplicate) is wider than the container that clips it.
// Static otherwise. There is no unit-count threshold: a count is the wrong
// shape, since three units fill a phone and do not fill 1280, and this one
// comparison is correct at every viewport by construction.
export const isTrackOverflowing = (trackWidthPx: number, containerWidthPx: number): boolean => trackWidthPx > containerWidthPx;

// Keeps a position within one track width of the origin, which is what
// makes the loop's duplicated track seamless: the track repeats exactly
// every `trackWidthPx`, so jumping by a whole track width never changes
// what is visually on screen. Advancing past the seam and stepping back
// across it both land on the position this returns for the unwrapped
// value, in both directions.
export const wrapTrackPosition = (position: number, trackWidthPx: number): number => {
  if (trackWidthPx <= 0) return position;
  if (position >= trackWidthPx) return position - trackWidthPx;
  if (position < 0) return position + trackWidthPx;
  return position;
};

// One arrow-key step: exactly one unit pitch, never a pixel amount, so a
// keyboard user never lands mid-name.
export const stepByUnitPitch = (position: number, direction: 1 | -1, unitPitchPx: number): number => position + direction * unitPitchPx;
