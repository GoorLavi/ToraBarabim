import { eq, inArray, sql } from 'drizzle-orm';

import { db } from '../../db/client';
import { cities, lessons, rabbis } from '../../db/schema';
import { RabbiNotFoundError } from './errors';
import type { RabbiCityRecord, RabbiDirectoryEntryRecord, RabbiListQuery, RabbiListResult, RabbiSummaryRecord } from './models';

type RabbiRow = typeof rabbis.$inferSelect;

const toSummary = (row: RabbiRow): RabbiSummaryRecord => ({
  id: row.id,
  name: row.name,
  title: row.title ?? undefined,
  photoUrl: row.photoUrl ?? undefined,
  bio: row.bio ?? undefined,
});

// The stored name carries its own honorific ('הרב', 'הרבנית'), so sorting on
// the raw name would file almost every rabbi under ה. This strips only the
// leading honorific for the sort key; the name a client receives is never
// touched.
const HONORIFIC_PREFIX = /^(הרבנית|הרב)\s+/;
const sortKey = (name: string): string => name.replace(HONORIFIC_PREFIX, '').trim();

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
    cityMap.set(row.code, { code: row.code, nameHe: row.nameHe, area: row.area });
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

export const list = async (query: RabbiListQuery): Promise<RabbiListResult> => {
  const rows = await db.select().from(rabbis);
  const sorted = [...rows].sort((a, b) => collator.compare(sortKey(a.name), sortKey(b.name)));

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
