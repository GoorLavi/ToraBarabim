import type { HomeRow } from '@torabarabim/common';

import { WOMENS_AREA_BAND_SLOT } from './consts';

// The index, within the rendered rail array, right after the `n`th
// `kind: 'lessons'` row: the course row (at most one, placed by the server
// right after the first lesson row) is never counted (plan section 10.7,
// "the women's band and the dedication band keep their positions after the
// second lesson row and the course row is not counted"). Clamped to the end
// of the list when there are fewer than `n` lesson rows, the same fail-open
// behaviour the old `Math.min(WOMENS_AREA_BAND_SLOT, railCount)` had.
export const indexAfterNthLessonRow = (rows: HomeRow[], n: number): number => {
  let lessonRowsSeen = 0;
  for (const [index, row] of rows.entries()) {
    if (row.kind !== 'lessons') continue;
    lessonRowsSeen += 1;
    if (lessonRowsSeen === n) return index + 1;
  }
  return rows.length;
};

// Fail closed on an unsatisfiable placement: below three lesson rows,
// "after two lesson rows" is also the very end of the list, which is
// adjacent to both the first and the last thing a browsing reader meets, so
// there is no slot that is only "after two lesson rows" (design-system.md,
// dedication Placement). Nothing a reader can see is lost, since the foot
// band is independent of rail count.
export const shouldShowBetweenRailsDedication = (lessonRowCount: number, hasDedicationItems: boolean): boolean =>
  hasDedicationItems && lessonRowCount >= WOMENS_AREA_BAND_SLOT + 1;

// The slot the between-rails band is spliced into: the women's-area band's
// own slot when it is not rendered, or immediately after it when it is, so
// a dedication never lands before it.
export const dedicationBandSlot = (womensAreaBandIndex: number, showWomensAreaBand: boolean): number =>
  womensAreaBandIndex + (showWomensAreaBand ? 1 : 0);
