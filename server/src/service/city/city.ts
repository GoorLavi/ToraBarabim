import { asc, desc, eq, like, sql } from 'drizzle-orm';

import { db } from '../../db/client';
import { cities } from '../../db/schema';
import { CITY_SEARCH_LIMIT } from './consts';
import type { CitySearchQuery, ResolvedCity } from './models';

// `%` and `_` are LIKE wildcards; escape them so a city name containing
// either, or a user typing one, cannot change what the prefix match does.
const escapeLikePattern = (value: string): string => value.replace(/[\\%_]/g, (char) => `\\${char}`);

export const search = async (query: CitySearchQuery): Promise<ResolvedCity[]> => {
  const q = query.q?.trim();
  if (!q) return [];

  const pattern = `${escapeLikePattern(q)}%`;

  return db
    .select({ code: cities.code, nameHe: cities.nameHe, area: cities.area })
    .from(cities)
    .where(like(cities.nameHe, pattern))
    // Exact matches first, then largest population first (a city with no
    // population row sorts last within its tier, never first), then
    // alphabetically as the final tiebreak.
    .orderBy(desc(eq(cities.nameHe, q)), sql`${cities.population} DESC NULLS LAST`, asc(cities.nameHe))
    .limit(CITY_SEARCH_LIMIT);
};
