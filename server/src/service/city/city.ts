import type { Area } from '@torabarabim/common';
import { asc, desc, eq, like, sql } from 'drizzle-orm';

import { db } from '../../db/client';
import { cities, lessons, rabbis } from '../../db/schema';
import { AREAS } from '../../db/schema/enums';
import { AREA_NAMES_HE, toAreaSlug } from '../shared/consts';
import { toRabbiSummary as toRabbi } from '../shared/rabbi-summary';
import { toSlug } from '../shared/slug';
import { CITY_SEARCH_LIMIT } from './consts';
import { CityNotFoundError } from './errors';
import type { CityAreaGroup, CityDetailResult, CityDirectoryResult, CitySearchQuery, ResolvedCity } from './models';

const collator = new Intl.Collator('he');

type CityRow = { code: number; nameHe: string; area: Area };

const toResolvedCity = (row: CityRow): ResolvedCity => ({ ...row, slug: toSlug(row.nameHe) });

// `%` and `_` are LIKE wildcards; escape them so a city name containing
// either, or a user typing one, cannot change what the prefix match does.
const escapeLikePattern = (value: string): string => value.replace(/[\\%_]/g, (char) => `\\${char}`);

export const search = async (query: CitySearchQuery): Promise<ResolvedCity[]> => {
  const q = query.q?.trim();
  if (!q) return [];

  const pattern = `${escapeLikePattern(q)}%`;

  const rows = await db
    .select({ code: cities.code, nameHe: cities.nameHe, area: cities.area })
    .from(cities)
    .where(like(cities.nameHe, pattern))
    // Exact matches first, then largest population first (a city with no
    // population row sorts last within its tier, never first), then
    // alphabetically as the final tiebreak.
    .orderBy(desc(eq(cities.nameHe, q)), sql`${cities.population} DESC NULLS LAST`, asc(cities.nameHe))
    .limit(CITY_SEARCH_LIMIT);

  return rows.map(toResolvedCity);
};

// Every city and every lesson's city code are each loaded once and joined
// in memory, so counting lessons per city never runs a query per row.
export const listDirectory = async (): Promise<CityDirectoryResult> => {
  const [cityRows, countRows] = await Promise.all([
    db.select({ code: cities.code, nameHe: cities.nameHe, area: cities.area }).from(cities),
    db.select({ cityCode: lessons.cityCode, count: sql<number>`count(*)::int` }).from(lessons).groupBy(lessons.cityCode),
  ]);

  const countByCode = new Map(countRows.map((row) => [row.cityCode, row.count] as const));

  const citiesWithLessons = cityRows
    .map((row) => ({ ...toResolvedCity(row), lessonCount: countByCode.get(row.code) ?? 0 }))
    .filter((row) => row.lessonCount > 0);

  const areas: CityAreaGroup[] = AREAS.map((area) => ({
    area,
    areaName: AREA_NAMES_HE[area],
    slug: toAreaSlug(area),
    cities: citiesWithLessons.filter((row) => row.area === area).sort((a, b) => collator.compare(a.nameHe, b.nameHe)),
  })).filter((group) => group.cities.length > 0);

  return { areas };
};

// The cities table is about 1,300 rows, the same size `listDirectory` above
// already loads unfiltered; matching the slug in memory here reuses that
// same cost rather than introducing a new one, and keeps the slug's
// definition (`toSlug(nameHe)`) in exactly one place instead of also
// expressing it in SQL.
export const resolveBySlug = async (slug: string): Promise<CityDetailResult> => {
  const cityRows = await db.select({ code: cities.code, nameHe: cities.nameHe, area: cities.area }).from(cities);
  const cityRow = cityRows.find((row) => toSlug(row.nameHe) === slug);
  if (!cityRow) {
    throw new CityNotFoundError(slug);
  }

  const rabbiRows = await db
    .select({
      id: rabbis.id,
      name: rabbis.name,
      title: rabbis.title,
      photoUrl: rabbis.photoUrl,
      bio: rabbis.bio,
    })
    .from(lessons)
    .innerJoin(rabbis, eq(lessons.rabbiId, rabbis.id))
    .where(eq(lessons.cityCode, cityRow.code));

  // A rabbi with several lessons in the same city joins in once per lesson;
  // de-duplicate by id so the city page lists each rabbi once.
  const distinctRabbis = [...new Map(rabbiRows.map((row) => [row.id, toRabbi(row)] as const)).values()];

  return {
    ...toResolvedCity(cityRow),
    areaName: AREA_NAMES_HE[cityRow.area],
    areaSlug: toAreaSlug(cityRow.area),
    rabbis: distinctRabbis.sort((a, b) => collator.compare(a.name, b.name)),
  };
};
