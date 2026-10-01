import type { CourseSummaryRecord } from '../course/models';
import { COURSE_ROW_TITLE, HELP_TILE_KINDS, HELP_TILE_MIN_INDEX } from './consts';
import type { CourseHomeRowResult, HomeRowResult, LessonHomeRowResult } from './models';

// Pure so it can be proven without a database: no listed course ever means
// no row, and one listed course always lands right after the first lesson
// row, or at index 0 when there is none (plain A, the owner's call at the
// gate). Sent from the first course, with no count cap and no lookahead cap
// (spec section 5), and with no skew mitigation for an open tab during a
// deploy.
export const placeCourseRow = (lessonRows: LessonHomeRowResult[], courseItems: CourseSummaryRecord[]): HomeRowResult[] => {
  if (courseItems.length === 0) return lessonRows;
  const courseRow: CourseHomeRowResult = { kind: 'courses', id: 'courses', title: COURSE_ROW_TITLE, items: courseItems };
  return [...lessonRows.slice(0, 1), courseRow, ...lessonRows.slice(1)];
};

// Draws without replacement from a copy, so the caller's array is untouched
// and the number of `random` calls is exactly the array's length.
const shuffled = <T>(values: readonly T[], random: () => number): T[] => {
  const pool = [...values];
  const result: T[] = [];
  while (pool.length > 0) {
    result.push(...pool.splice(Math.floor(random() * pool.length), 1));
  }
  return result;
};

// Deliberately breaks the reproducibility `hashLessonId` (`home.ts`) keeps
// for the card order: the rows that get a tile, which kind each gets, and
// the slot are all drawn from `random` on every request. Randomness is
// injected, never read here, so a fixed `random` gives a fixed result.
//
// Rules: only rows without the women's-area tile are eligible (so the two
// tiles never share a row and never sit side by side); each kind appears at
// most once per page; a row carries at most one tile; the slot is an
// integer in [HELP_TILE_MIN_INDEX, items.length]. Runs before
// `placeCourseRow`, so the course row never gets one.
export const placeHelpTiles = (lessonRows: LessonHomeRowResult[], random: () => number): LessonHomeRowResult[] => {
  const eligibleRowIndexes = lessonRows.flatMap((row, rowIndex) =>
    row.womensAreaTileIndex === undefined && row.items.length >= HELP_TILE_MIN_INDEX ? [rowIndex] : [],
  );

  const rowIndexes = shuffled(eligibleRowIndexes, random);
  const kinds = shuffled(HELP_TILE_KINDS, random);
  const placedRows = [...lessonRows];

  kinds.forEach((kind, position) => {
    const rowIndex = rowIndexes[position];
    const row = rowIndex === undefined ? undefined : lessonRows[rowIndex];
    if (rowIndex === undefined || !row) return;

    const slotCount = row.items.length - HELP_TILE_MIN_INDEX + 1;
    const index = HELP_TILE_MIN_INDEX + Math.floor(random() * slotCount);
    placedRows[rowIndex] = { ...row, helpTile: { kind, index } };
  });

  return placedRows;
};
