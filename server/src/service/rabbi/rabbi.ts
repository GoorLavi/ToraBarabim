import { eq, inArray, sql } from 'drizzle-orm';

import { db } from '../../db/client';
import { cities, lessons, rabbis } from '../../db/schema';
import { isRabbiInDirectoryScope } from '../shared/audience-scope';
import { compareRabbiOrder } from '../shared/rabbi-order';
import { toRabbiSummary } from '../shared/rabbi-summary';
import { toSlug } from '../shared/slug';
import { RabbiNotFoundError } from './errors';
import type { RabbiCityRecord, RabbiDirectoryEntryRecord, RabbiListQuery, RabbiListResult, RabbiSummaryRecord } from './models';

type RabbiRow = typeof rabbis.$inferSelect;

const toSummary = (row: RabbiRow): RabbiSummaryRecord => toRabbiSummary(row);

const collator = new Intl.Collator('he');

interface LessonStats {
  lessonCount: number;
  cities: RabbiCityRecord[];
}

const emptyStats: LessonStats = { lessonCount: 0, cities: [] };

// Loads the lesson count and the distinct cities for a set of rabbi ids in
// two queries total, no matter how many ids are passed. Shared by `list`
// (the whole page's ids at once) and `getById` (a single id), so a rabbi's
// stats are computed in exactly one place.
const loadLessonStats = async (rabbiIds: string[]): Promise<Map<string, LessonStats>> => {
  if (rabbiIds.length === 0) return new Map();

  const [countRows, cityRows] = await Promise.all([
    db
      .select({ rabbiId: lessons.rabbiId, count: sql<number>`count(*)::int` })
      .from(lessons)
      .where(inArray(lessons.rabbiId, rabbiIds))
      .groupBy(lessons.rabbiId),
    db
      .select({ rabbiId: lessons.rabbiId, code: cities.code, nameHe: cities.nameHe, area: cities.area })
      .from(lessons)
      .innerJoin(cities, eq(lessons.cityCode, cities.code))
      .where(inArray(lessons.rabbiId, rabbiIds)),
  ]);

  const countByRabbi = new Map(countRows.map((row) => [row.rabbiId, row.count] as const));

  const citiesByRabbi = new Map<string, Map<number, RabbiCityRecord>>();
  for (const row of cityRows) {
    const cityMap = citiesByRabbi.get(row.rabbiId) ?? new Map<number, RabbiCityRecord>();
    cityMap.set(row.code, { code: row.code, nameHe: row.nameHe, slug: toSlug(row.nameHe), area: row.area });
    citiesByRabbi.set(row.rabbiId, cityMap);
  }

  return new Map(
    rabbiIds.map((id) => {
      const cityMap = citiesByRabbi.get(id);
      const cityList = cityMap ? [...cityMap.values()].sort((a, b) => collator.compare(a.nameHe, b.nameHe)) : [];
      return [id, { lessonCount: countByRabbi.get(id) ?? 0, cities: cityList }] as const;
    }),
  );
};

const toDirectoryEntry = (row: RabbiRow, stats: LessonStats): RabbiDirectoryEntryRecord => ({
  ...toSummary(row),
  lessonCount: stats.lessonCount,
  cities: stats.cities,
});

// One query for every rabbi id with at least one lesson, so ordering rule
// 2 (has-lessons before none, within a tier) is decided for the whole list
// before paging, not just for the page's own rows: a per-row query here
// would run once per rabbi instead of once total.
const loadRabbiIdsWithLessons = async (): Promise<Set<string>> => {
  const rows = await db.selectDistinct({ rabbiId: lessons.rabbiId }).from(lessons);
  return new Set(rows.map((row) => row.rabbiId));
};

// Matches `toSlug(name)` against `toSlug(query)` as a substring, the
// project's one normalizer, rather than a second notion of "close enough"
// like a raw SQL `ILIKE`. A query that normalizes to nothing (for example,
// only punctuation) is treated as no filter rather than as a filter nothing
// can pass.
const matchesQuery = (name: string, query: string): boolean => {
  const normalizedQuery = toSlug(query);
  return normalizedQuery === '' || toSlug(name).includes(normalizedQuery);
};

export const list = async (query: RabbiListQuery): Promise<RabbiListResult> => {
  const [rows, rabbiIdsWithLessons] = await Promise.all([db.select().from(rabbis), loadRabbiIdsWithLessons()]);
  const scoped = rows.filter((row) => isRabbiInDirectoryScope(query.scope, row.honorific) && (!query.q || matchesQuery(row.name, query.q)));
  const sorted = [...scoped].sort((a, b) =>
    compareRabbiOrder(
      { id: a.id, name: a.name, prominence: a.prominence, hasLessons: rabbiIdsWithLessons.has(a.id) },
      { id: b.id, name: b.name, prominence: b.prominence, hasLessons: rabbiIdsWithLessons.has(b.id) },
    ),
  );

  const total = sorted.length;
  const start = (query.page - 1) * query.pageSize;
  const pageRows = sorted.slice(start, start + query.pageSize);

  const statsByRabbi = await loadLessonStats(pageRows.map((row) => row.id));
  const items = pageRows.map((row) => toDirectoryEntry(row, statsByRabbi.get(row.id) ?? emptyStats));

  return { items, page: query.page, pageSize: query.pageSize, total };
};

export const getById = async (rabbiId: string): Promise<RabbiDirectoryEntryRecord> => {
  const [rabbiRow] = await db.select().from(rabbis).where(eq(rabbis.id, rabbiId)).limit(1);
  if (!rabbiRow) {
    throw new RabbiNotFoundError(rabbiId);
  }

  const statsByRabbi = await loadLessonStats([rabbiId]);
  return toDirectoryEntry(rabbiRow, statsByRabbi.get(rabbiId) ?? emptyStats);
};
