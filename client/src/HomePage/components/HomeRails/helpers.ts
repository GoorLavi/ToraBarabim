import { WOMENS_AREA_BAND_SLOT } from './consts';

// Fail closed on an unsatisfiable placement: below three rails, "after two
// rails" is also the very end of the list, which is adjacent to both the
// first and the last thing a browsing reader meets, so there is no slot
// that is only "after two rails" (design-system.md, dedication Placement).
// Nothing a reader can see is lost, since the foot band is independent of
// rail count.
export const shouldShowBetweenRailsDedication = (railCount: number, hasDedicationItems: boolean): boolean =>
  hasDedicationItems && railCount >= WOMENS_AREA_BAND_SLOT + 1;

// The slot the between-rails band is spliced into, expressed relative to
// `WOMENS_AREA_BAND_SLOT` rather than a second literal: the women's-area
// tile's own slot when it is not rendered, or immediately after it when it
// is, so a dedication never lands before it.
export const dedicationBandSlot = (railCount: number, showWomensAreaBand: boolean): number =>
  Math.min(WOMENS_AREA_BAND_SLOT, railCount) + (showWomensAreaBand ? 1 : 0);
