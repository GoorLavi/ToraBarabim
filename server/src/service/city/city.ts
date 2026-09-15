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
import type {
  CityAreaGroup,
  CityAreaSuggestionGroup,
  CityDetailResult,
  CityDirectoryResult,
  CitySearchQuery,
  CitySearchResult,
  CitySuggestionsResult,
  CityWithLessonCount,
  ResolvedCity,
} from './models';

const collator = new Intl.Collator('he');

type CityRow = { code: number; nameHe: string; area: Area };

const toResolvedCity = (row: CityRow): ResolvedCity => ({ ...row, slug: toSlug(row.nameHe) });

// `%` and `_` are LIKE wildcards; escape them so a city name containing
// either, or a user typing one, cannot change what the prefix match does.
const escapeLikePattern = (value: string): string => value.replace(/[\\%_]/g, (char) => `\\${char}`);

export const search = async (query: CitySearchQuery): Promise<CitySearchResult[]> => {
  const q = query.q?.trim();
  if (!q) return [];

  const pattern = `${escapeLikePattern(q)}%`;

  const rows = await db
    .select({
      code: cities.code,
      nameHe: cities.nameHe,
      area: cities.area,
      lessonCount: sql<number>`count(${lessons.id})::int`,
    })
    .from(cities)
    .leftJoin(lessons, eq(lessons.cityCode, cities.code))
    .where(like(cities.nameHe, pattern))
    // Grouping by the primary key alone is enough for Postgres to let every
    // other selected or ordered column of `cities` through ungrouped.
    .groupBy(cities.code)
    // Exact matches first, then largest population first (a city with no
    // population row sorts last within its tier, never first), then
    // alphabetically as the final tiebreak.
    .orderBy(desc(eq(cities.nameHe, q)), sql`${cities.population} DESC NULLS LAST`, asc(cities.nameHe))
    .limit(CITY_SEARCH_LIMIT);

  return rows.map((row) => ({
    ...toResolvedCity(row),
    lessonCount: row.lessonCount,
    areaName: AREA_NAMES_HE[row.area],
  }));
};

type CityWithLessonSupply = CityWithLessonCount & { population: number | null };

// Every city and every lesson's city code are each loaded once and joined
// in memory, so counting lessons per city never runs a query per row.
// `listDirectory` and `listSuggestions` are its two callers: they group and
// order the result differently, so this only loads and filters.
const loadCitiesWithLessonCounts = async (): Promise<CityWithLessonSupply[]> => {
  const [cityRows, countRows] = await Promise.all([
    db.select({ code: cities.code, nameHe: cities.nameHe, area: cities.area, population: cities.population }).from(cities),
    db.select({ cityCode: lessons.cityCode, count: sql<number>`count(*)::int` }).from(lessons).groupBy(lessons.cityCode),
  ]);

  const countByCode = new Map(countRows.map((row) => [row.cityCode, row.count] as const));

  return cityRows
    .map((row) => ({ ...toResolvedCity(row), population: row.population, lessonCount: countByCode.get(row.code) ?? 0 }))
    .filter((row) => row.lessonCount > 0);
};

// The public city directory (`/cities`) is scanned by name, so its order is
// alphabetical. The suggestions picker below orders the same underlying
// data by lesson supply instead; two callers, two orders, on purpose.
export const listDirectory = async (): Promise<CityDirectoryResult> => {
  const citiesWithLessons = await loadCitiesWithLessonCounts();

  const areas: CityAreaGroup[] = AREAS.map((area) => ({
    area,
    areaName: AREA_NAMES_HE[area],
    slug: toAreaSlug(area),
    cities: citiesWithLessons.filter((row) => row.area === area).sort((a, b) => collator.compare(a.nameHe, b.nameHe)),
  })).filter((group) => group.cities.length > 0);

  return { areas };
};

// Ranks by lesson count first, since that is the popularity this endpoint
// exists to surface; population only breaks a tie in lesson count, and a
// city with no census row sorts last within its tier rather than first.
const byLessonSupply = (a: CityWithLessonSupply, b: CityWithLessonSupply): number => {
  if (a.lessonCount !== b.lessonCount) return b.lessonCount - a.lessonCount;
  if (a.population !== b.population) {
    if (a.population === null) return 1;
    if (b.population === null) return -1;
    return b.population - a.population;
  }
  return collator.compare(a.nameHe, b.nameHe);
};

export const listSuggestions = async (): Promise<CitySuggestionsResult> => {
  const citiesWithLessons = await loadCitiesWithLessonCounts();

  const areas: CityAreaSuggestionGroup[] = AREAS.map((area) => {
    const areaCities = citiesWithLessons.filter((row) => row.area === area).sort(byLessonSupply);
    return {
      area,
      areaName: AREA_NAMES_HE[area],
      slug: toAreaSlug(area),
      cities: areaCities,
      areaLessonCount: areaCities.reduce((total, row) => total + row.lessonCount, 0),
    };
  })
    .filter((group) => group.cities.length > 0)
    .sort((a, b) => {
      if (a.areaLessonCount !== b.areaLessonCount) return b.areaLessonCount - a.areaLessonCount;
      return collator.compare(a.areaName, b.areaName);
    });

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
      honorific: rabbis.honorific,
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
