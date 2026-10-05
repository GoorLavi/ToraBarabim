import type { HomeRow } from '@torabarabim/common';

// The index, within the rendered rail array, right after the `n`th
// `kind: 'lessons'` row: the course row (at most one, placed by the server
// right after the first lesson row) is never counted (plan section 10.7,
// "the women's band and the dedication band keep their positions after the
// second lesson row and the course row is not counted"). Clamped to the end
// of the list when there are fewer than `n` lesson rows: fail open, so a band
// on a thin page still shows, after the last rail.
export const indexAfterNthLessonRow = (rows: HomeRow[], n: number): number => {
  let lessonRowsSeen = 0;
  for (const [index, row] of rows.entries()) {
    if (row.kind !== 'lessons') continue;
    lessonRowsSeen += 1;
    if (lessonRowsSeen === n) return index + 1;
  }
  return rows.length;
};
