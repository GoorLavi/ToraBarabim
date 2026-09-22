import { and, eq } from 'drizzle-orm';

import { db } from '../../db/client';
import { cities, places } from '../../db/schema';
import { toSlug } from '../shared/slug';
import { PLACE_SIMILAR_LIMIT } from './consts';
import { PlaceNotFoundError } from './errors';
import type { PlaceListResult, PlaceRecord, SimilarPlaceQuery } from './models';

const collator = new Intl.Collator('he');

const placeSelection = {
  id: places.id,
  slug: places.slug,
  name: places.name,
  street: places.street,
  floor: places.floor,
  cityCode: places.cityCode,
  cityName: cities.nameHe,
  area: cities.area,
  photoUrl: places.photoUrl,
};

const basePlaceQuery = () => db.select(placeSelection).from(places).innerJoin(cities, eq(places.cityCode, cities.code));

type JoinedPlaceRow = Awaited<ReturnType<typeof basePlaceQuery>>[number];

const toRecord = (row: JoinedPlaceRow): PlaceRecord => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  street: row.street,
  floor: row.floor ?? undefined,
  cityCode: row.cityCode,
  cityName: row.cityName,
  citySlug: toSlug(row.cityName),
  area: row.area,
  photoUrl: row.photoUrl ?? undefined,
});

// Every active place, unfiltered and unpaged: the list is small and
// curated, never a search surface. Alphabetical by name, Hebrew collation.
export const list = async (): Promise<PlaceListResult> => {
  const rows = await basePlaceQuery().where(eq(places.isActive, true));
  return { items: rows.map(toRecord).sort((a, b) => collator.compare(a.name, b.name)) };
};

// 404 on inactive, not 410: deactivation is reversible, so a deactivated
// place answers exactly the same 404 as one that never existed.
export const getById = async (id: string): Promise<PlaceRecord> => {
  const rows = await basePlaceQuery().where(and(eq(places.id, id), eq(places.isActive, true))).limit(1);
  const row = rows[0];
  if (!row) throw new PlaceNotFoundError(id);
  return toRecord(row);
};

export interface SimilarAddressCandidate {
  street: string;
  name: string;
  cityCode: number;
  isActive: boolean;
}

// Pure, no database: "resembling" means exactly `toSlug(typedStreet) ===
// toSlug(candidate.street)` or `toSlug(typedName) === toSlug(candidate.name)`,
// scoped to the same city and to an active place. Exact-after-normalization,
// the same contract `toSlug` itself keeps: no scoring, no fuzzy match, and
// no tuning knob.
//
// Two gaps are documented on purpose, not defects: 'הרצל 12' never matches
// 'הרצל 12א' (the trailing letter survives normalization), and 'רח׳ הרצל
// 12' never matches 'הרצל 12' (the 'רח' token also survives it). The owner
// chose to keep both rather than add fuzzing that `toSlug`'s own contract
// does not otherwise allow.
export const isSimilarAddress = (
  input: { cityCode: number; name?: string; street?: string },
  candidate: SimilarAddressCandidate,
): boolean => {
  if (!candidate.isActive) return false;
  if (candidate.cityCode !== input.cityCode) return false;

  const streetMatches = input.street !== undefined && toSlug(input.street) === toSlug(candidate.street);
  const nameMatches = input.name !== undefined && toSlug(input.name) === toSlug(candidate.name);
  return streetMatches || nameMatches;
};

// The duplicate hint: at most `PLACE_SIMILAR_LIMIT` matches, street matches
// ordered first, then Hebrew collation on the name. Never blocks a save and
// has no bearing on validation; the caller decides whether to offer it.
export const findSimilar = async (query: SimilarPlaceQuery): Promise<PlaceRecord[]> => {
  const rows = await basePlaceQuery().where(and(eq(places.cityCode, query.cityCode), eq(places.isActive, true)));

  const streetMatches = (row: JoinedPlaceRow): boolean => query.street !== undefined && toSlug(query.street) === toSlug(row.street);

  const matches = rows.filter((row) =>
    isSimilarAddress(query, { street: row.street, name: row.name, cityCode: row.cityCode, isActive: true }),
  );

  matches.sort((a, b) => {
    const aStreetMatch = streetMatches(a);
    const bStreetMatch = streetMatches(b);
    if (aStreetMatch !== bStreetMatch) return aStreetMatch ? -1 : 1;
    return collator.compare(a.name, b.name);
  });

  return matches.slice(0, PLACE_SIMILAR_LIMIT).map(toRecord);
};
