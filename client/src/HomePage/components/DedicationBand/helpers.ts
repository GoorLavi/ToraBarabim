import {
  DEDICATION_CLOSING_SIZE_FLOOR_PX,
  DEDICATION_CLOSING_SIZE_REFERENCE,
  DEDICATION_DONOR_MARGIN_TOP_FLOOR_PX,
  DEDICATION_DONOR_MARGIN_TOP_REFERENCE,
  DEDICATION_FORMULA_SIZE_FLOOR_PX,
  DEDICATION_FORMULA_SIZE_REFERENCE,
  DEDICATION_NAME_SIZE_FLOOR_PX,
  DEDICATION_NAME_SIZE_REFERENCE,
  DEDICATION_ORNAMENT_TO_TEXT_GAP_FLOOR_PX,
  DEDICATION_ORNAMENT_TO_TEXT_GAP_REFERENCE,
  DEDICATION_ORNAMENT_WIDTH_FLOOR_PX,
  DEDICATION_ORNAMENT_WIDTH_REFERENCE,
  DEDICATION_PARENT_SIZE_FLOOR_PX,
  DEDICATION_PARENT_SIZE_REFERENCE,
  ORNAMENT_VIEWBOX_HEIGHT,
  ORNAMENT_VIEWBOX_WIDTH,
} from '~/components/DedicationUnit/consts';
import { ARGAMAN_VE_ZAHAV_THEME } from '~/theme/themes';

import { DEDICATION_BAND_EDGE_PADDING_PX, DEDICATION_BAND_PADDING_FLOOR_PX, DEDICATION_UNIT_GAP_PX } from './consts';

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

const clampedPx = (floorPx: number, referenceNumber: number, scale: number): number => Math.max(floorPx, referenceNumber * scale);

// The exact `max(floor, reference * scale)` every scaled dedication value
// already applies in CSS (DedicationUnit/styles.ts, DedicationUnit/consts.ts:
// scaledCss), reproduced here in TypeScript so the `.pending` reservation
// (DedicationBand/styles.ts) can know ahead of the real draw what the band
// is actually guaranteed to need. `--dedication-scale-px` used to be a
// runtime function of the viewport, which made this impossible to
// precompute; now that it is two fixed values selected by breakpoint
// (DedicationBand/consts.ts), the true total can be summed once, per
// breakpoint, at module load.
// A single `max(bandFloor, bandReference * scale)` over the band as a whole
// cannot stand in for this: formula, name, parent, closing and donor each
// clamp to their own floor at a different scale, so at a scale between two
// of those thresholds the true total is a sum of independently clamped
// pieces, never equal to treating the band as one scaled value.
export const dedicationBandReservedHeightPx = (scale: number, paddingReferenceNumber: number): number => {
  const { spacing, typography } = ARGAMAN_VE_ZAHAV_THEME;
  const lineGapPx = Number.parseFloat(spacing.xs);

  const ornamentWidthPx = clampedPx(DEDICATION_ORNAMENT_WIDTH_FLOOR_PX, DEDICATION_ORNAMENT_WIDTH_REFERENCE, scale);
  const ornamentHeightPx = ornamentWidthPx * (ORNAMENT_VIEWBOX_HEIGHT / ORNAMENT_VIEWBOX_WIDTH);
  const ornamentToTextGapPx = clampedPx(DEDICATION_ORNAMENT_TO_TEXT_GAP_FLOOR_PX, DEDICATION_ORNAMENT_TO_TEXT_GAP_REFERENCE, scale);

  const formulaHeightPx = clampedPx(DEDICATION_FORMULA_SIZE_FLOOR_PX, DEDICATION_FORMULA_SIZE_REFERENCE, scale) * Number.parseFloat(typography.dedicationFormula.lineHeight);
  const nameHeightPx = clampedPx(DEDICATION_NAME_SIZE_FLOOR_PX, DEDICATION_NAME_SIZE_REFERENCE, scale) * Number.parseFloat(typography.dedicationName.lineHeight);
  const parentHeightPx = clampedPx(DEDICATION_PARENT_SIZE_FLOOR_PX, DEDICATION_PARENT_SIZE_REFERENCE, scale) * Number.parseFloat(typography.dedicationParent.lineHeight);
  // The donor credit line reuses the closing role's own size (DedicationUnit/styles.ts), never a role of its own.
  const closingHeightPx = clampedPx(DEDICATION_CLOSING_SIZE_FLOOR_PX, DEDICATION_CLOSING_SIZE_REFERENCE, scale) * Number.parseFloat(typography.dedicationClosing.lineHeight);
  const donorMarginTopPx = clampedPx(DEDICATION_DONOR_MARGIN_TOP_FLOOR_PX, DEDICATION_DONOR_MARGIN_TOP_REFERENCE, scale);

  // The worst case a group can actually draw: every optional line present
  // (formula, name, parent, closing, donor credit), the same shape
  // DEDICATION_BAND_ON_PRIMARY_HEIGHT_REFERENCE was itself measured against.
  const textBlockHeightPx =
    formulaHeightPx + lineGapPx + nameHeightPx + lineGapPx + parentHeightPx + lineGapPx + closingHeightPx + lineGapPx + donorMarginTopPx + closingHeightPx;

  const unitHeightPx = 2 * ornamentHeightPx + 2 * ornamentToTextGapPx + textBlockHeightPx;
  const paddingBlockPx = 2 * clampedPx(DEDICATION_BAND_PADDING_FLOOR_PX, paddingReferenceNumber, scale);

  return unitHeightPx + paddingBlockPx;
};
