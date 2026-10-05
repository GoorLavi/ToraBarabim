import type { CityWithLessonCount, HomeLessonRowId } from '@torabarabim/common';

import type { CourseSummaryRecord } from '../course/models';
import { compareIsoDates } from '../lesson/israel-time';
import type { AddressCityRow } from '../shared/address';
import { toCitySummary } from '../shared/city-summary';
import { MAX_ITEMS_PER_ROW } from '../shared/consts';
import {
  COURSE_ROW_TITLE,
  HELP_TILE_KINDS,
  HELP_TILE_MIN_INDEX,
  HOME_CITY_GRID_CAP,
  MAX_HOME_LESSON_ROWS,
  MAX_LESSONS_PER_RABBI_PER_ROW,
  MIDDAY_ENDS_AT,
  MIN_ITEMS_PER_ROW,
  MORNING_ENDS_AT,
  WOMENS_AREA_TILE_FALLBACK_FIRST_ROW,
  WOMENS_AREA_TILE_FIRST_CANDIDATE_ROW,
  WOMENS_AREA_TILE_INDEX,
  WOMENS_AREA_TILE_MIN_LESSONS,
} from './consts';
import type { CourseHomeRowResult, HomeRowResult, LessonHomeRowResult, ResolvedHomeOccurrence, RowFamilies, TimeBand } from './models';

export const hebrewCollator = new Intl.Collator('he');

export const timeBandOf = (startTime: string): TimeBand | undefined => {
  if (startTime < MORNING_ENDS_AT) return 'morning';
  if (startTime < MIDDAY_ENDS_AT) return 'midday';
  return undefined;
};

const pickNearestPerLesson = (occurrences: ResolvedHomeOccurrence[]): ResolvedHomeOccurrence[] => {
  const nearestByLessonId = new Map<string, ResolvedHomeOccurrence>();
  for (const occurrence of occurrences) {
    const existing = nearestByLessonId.get(occurrence.lessonId);
    if (!existing || compareIsoDates(occurrence.date, existing.date) < 0) {
      nearestByLessonId.set(occurrence.lessonId, occurrence);
    }
  }
  return [...nearestByLessonId.values()];
};

// A small deterministic hash of the lesson id sits in `shuffleKey` as a
// stable secondary key within a prominence tier, so the order is
// reproducible across requests.
const orderByProminence = (occurrences: ResolvedHomeOccurrence[]): ResolvedHomeOccurrence[] =>
  [...occurrences].sort((a, b) => a.rabbiProminenceRank - b.rabbiProminenceRank || a.shuffleKey - b.shuffleKey);

// Keeps each teacher's first MAX_LESSONS_PER_RABBI_PER_ROW lessons, so the
// input must already be in display order. The teacher is who actually
// teaches the occurrence: the substitute when there is one.
export const capPerTeachingRabbi = (ordered: ResolvedHomeOccurrence[]): ResolvedHomeOccurrence[] => {
  const keptByRabbiId = new Map<string, number>();
  return ordered.filter((occurrence) => {
    const teacherId = occurrence.substituteRabbi?.id ?? occurrence.rabbi.id;
    const kept = keptByRabbiId.get(teacherId) ?? 0;
    if (kept >= MAX_LESSONS_PER_RABBI_PER_ROW) return false;
    keptByRabbiId.set(teacherId, kept + 1);
    return true;
  });
};

// The cap runs before the slice so a teacher's surplus lessons free their
// places for others instead of leaving the row short.
export const buildRow = (id: HomeLessonRowId, title: string, matches: ResolvedHomeOccurrence[]): LessonHomeRowResult | undefined => {
  const items = capPerTeachingRabbi(orderByProminence(pickNearestPerLesson(matches))).slice(0, MAX_ITEMS_PER_ROW);
  return items.length >= MIN_ITEMS_PER_ROW ? { kind: 'lessons', id, title, items } : undefined;
};

// Takes one row per family per round, in the order fixed, area, topic. Two
// rows of the same area or topic family never sit side by side: when the
// next row would, composition stops and everything after it is dropped,
// rather than reordering rows the ranking already placed.
export const interleaveRows = ({ fixed, areas, topics }: RowFamilies): LessonHomeRowResult[] => {
  const families = [
    { rows: fixed, canStack: true },
    { rows: areas, canStack: false },
    { rows: topics, canStack: false },
  ];
  const composed: { row: LessonHomeRowResult; familyIndex: number }[] = [];
  const roundCount = Math.max(...families.map((family) => family.rows.length));

  compose: for (let round = 0; round < roundCount; round += 1) {
    for (const [familyIndex, { rows, canStack }] of families.entries()) {
      const row = rows[round];
      if (!row) continue;
      if (!canStack && composed[composed.length - 1]?.familyIndex === familyIndex) break compose;
      composed.push({ row, familyIndex });
    }
  }

  return composed.map(({ row }) => row).slice(0, MAX_HOME_LESSON_ROWS);
};

// The one women's-area tile on the page. Scans from the sixth rail for the
// first row with room for it, and falls back to scanning from the second row
// so a short page still carries it. The caller decides whether a tile is
// wanted at all.
export const placeWomensAreaTile = (lessonRows: LessonHomeRowResult[]): LessonHomeRowResult[] => {
  const firstRowWithRoomFrom = (from: number): number =>
    lessonRows.findIndex((row, index) => index >= from && row.items.length >= WOMENS_AREA_TILE_MIN_LESSONS);

  const tileRowIndex = [WOMENS_AREA_TILE_FIRST_CANDIDATE_ROW, WOMENS_AREA_TILE_FALLBACK_FIRST_ROW]
    .map(firstRowWithRoomFrom)
    .find((index) => index !== -1);
  if (tileRowIndex === undefined) return lessonRows;

  return lessonRows.map((row, index) => (index === tileRowIndex ? { ...row, womensAreaTileIndex: WOMENS_AREA_TILE_INDEX } : row));
};

const toCitiesWithLessonCount = (countByCityCode: Map<number, number>, cityByCode: Map<number, AddressCityRow>): CityWithLessonCount[] =>
  [...countByCityCode.entries()].map(([code, lessonCount]) => {
    const cityRow = cityByCode.get(code);
    if (!cityRow) {
      throw new Error(`data inconsistency: a lesson references unknown city code ${code}`);
    }
    return { ...toCitySummary(cityRow), lessonCount };
  });

// Counts occurrences, not lessons: a lesson recurring three times in the
// window counts three times. Used by the women's set, whose copy says
// "{n} שיעורים בשבועיים הקרובים". Unsorted; each caller orders it.
export const countOccurrencesByCity = (occurrences: ResolvedHomeOccurrence[], cityByCode: Map<number, AddressCityRow>): CityWithLessonCount[] => {
  const countByCityCode = new Map<number, number>();
  for (const occurrence of occurrences) {
    countByCityCode.set(occurrence.cityCode, (countByCityCode.get(occurrence.cityCode) ?? 0) + 1);
  }
  return toCitiesWithLessonCount(countByCityCode, cityByCode);
};

// Counts distinct lessons with at least one occurrence in the window, which
// is what a visitor reads a city chip as. Unsorted; see `rankCitiesForGrid`.
export const countLessonsByCity = (occurrences: ResolvedHomeOccurrence[], cityByCode: Map<number, AddressCityRow>): CityWithLessonCount[] => {
  const lessonIdsByCityCode = new Map<number, Set<string>>();
  for (const occurrence of occurrences) {
    const lessonIds = lessonIdsByCityCode.get(occurrence.cityCode) ?? new Set<string>();
    lessonIds.add(occurrence.lessonId);
    lessonIdsByCityCode.set(occurrence.cityCode, lessonIds);
  }
  const countByCityCode = new Map([...lessonIdsByCityCode.entries()].map(([code, lessonIds]) => [code, lessonIds.size] as const));
  return toCitiesWithLessonCount(countByCityCode, cityByCode);
};

export const rankCitiesForGrid = (citiesWithCount: CityWithLessonCount[]): CityWithLessonCount[] =>
  [...citiesWithCount]
    .sort((a, b) => b.lessonCount - a.lessonCount || hebrewCollator.compare(a.name, b.name))
    .slice(0, HOME_CITY_GRID_CAP);

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
