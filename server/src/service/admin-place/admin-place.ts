import type { FastifyBaseLogger } from 'fastify';
import { desc, eq, ilike, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { loadConfig } from '../../config';
import { db } from '../../db/client';
import { cities, places } from '../../db/schema';
import storage from '../../storage/storage';
import { validatePlacePhoto } from '../place/photo';
import { toSlug } from '../shared/slug';
import { PlaceNotFoundError, UnknownCityError } from './errors';
import type { AdminPlaceListResult, AdminPlaceRecord, CreatePlaceInput, PlaceListQuery, UpdatePlaceInput } from './models';

// `%` and `_` are LIKE wildcards; escape them so a place name containing
// either cannot change what the search matches.
const escapeLikePattern = (value: string): string => value.replace(/[\\%_]/g, (char) => `\\${char}`);

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
  isActive: places.isActive,
};

const basePlaceQuery = () => db.select(placeSelection).from(places).innerJoin(cities, eq(places.cityCode, cities.code));

type JoinedPlaceRow = Awaited<ReturnType<typeof basePlaceQuery>>[number];

const toRecord = (row: JoinedPlaceRow): AdminPlaceRecord => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  street: row.street,
  floor: row.floor ?? undefined,
  cityCode: row.cityCode,
  cityName: row.cityName,
  area: row.area,
  photoUrl: row.photoUrl ?? undefined,
  isActive: row.isActive,
});

const verifyCityExists = async (cityCode: number): Promise<void> => {
  const rows = await db.select({ code: cities.code }).from(cities).where(eq(cities.code, cityCode)).limit(1);
  if (!rows[0]) throw new UnknownCityError(cityCode);
};

// Unfiltered by `isActive`: an administrator manages the whole roster,
// active or deactivated, unlike the public `/v1/places` list.
export const list = async (query: PlaceListQuery): Promise<AdminPlaceListResult> => {
  const condition = query.q ? ilike(places.name, `%${escapeLikePattern(query.q)}%`) : undefined;

  const [rows, totalRows] = await Promise.all([
    basePlaceQuery()
      .where(condition)
      .orderBy(desc(places.updatedAt))
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize),
    db.select({ count: sql<number>`count(*)::int` }).from(places).where(condition),
  ]);

  return { items: rows.map(toRecord), page: query.page, pageSize: query.pageSize, total: totalRows[0]?.count ?? 0 };
};

export const getById = async (id: string): Promise<AdminPlaceRecord> => {
  const rows = await basePlaceQuery().where(eq(places.id, id)).limit(1);
  const row = rows[0];
  if (!row) throw new PlaceNotFoundError(id);
  return toRecord(row);
};

export const create = async (input: CreatePlaceInput): Promise<AdminPlaceRecord> => {
  await verifyCityExists(input.cityCode);

  const id = nanoid();
  const [row] = await db
    .insert(places)
    .values({ id, slug: toSlug(input.name) || id, name: input.name, street: input.street, floor: input.floor ?? null, cityCode: input.cityCode })
    .returning({ id: places.id });
  if (!row) throw new Error('insert into places returned no row');
  return getById(row.id);
};

// A place edits its own profile in full, name and address included, and so
// does an administrator here: every lesson pointing at this place displays
// whatever this row currently holds. That is intended, not a gap: a venue
// is a shared entity (0016 reversed), not a per-lesson copy.
export const update = async (id: string, input: UpdatePlaceInput): Promise<AdminPlaceRecord> => {
  if (input.cityCode !== undefined) await verifyCityExists(input.cityCode);

  const [row] = await db
    .update(places)
    .set({
      ...input,
      // Recomputed only when the name actually changes: `places`, unlike
      // `rabbis`, stores its slug rather than deriving it at read time
      // (see `db/seed/places.ts`), so a rename must not leave it stale.
      ...(input.name !== undefined ? { slug: toSlug(input.name) || id } : {}),
      updatedAt: new Date(),
    })
    .where(eq(places.id, id))
    .returning({ id: places.id });
  if (!row) throw new PlaceNotFoundError(id);
  return getById(row.id);
};

const photoKeyFromUrl = (photoUrl: string): string | undefined => {
  const { storagePublicBaseUrl } = loadConfig(process.env);
  const prefix = `${storagePublicBaseUrl}/`;
  return photoUrl.startsWith(prefix) ? photoUrl.slice(prefix.length) : undefined;
};

export const replacePhoto = async (id: string, bytes: Buffer, log: FastifyBaseLogger): Promise<AdminPlaceRecord> => {
  const { contentType, extension } = validatePlacePhoto(bytes);
  const existing = await getById(id);

  const key = `places/${id}/${nanoid()}.${extension}`;
  const url = await storage.put(key, bytes, contentType);

  const [row] = await db.update(places).set({ photoUrl: url, updatedAt: new Date() }).where(eq(places.id, id)).returning({ id: places.id });
  if (!row) throw new PlaceNotFoundError(id);

  const previousKey = existing.photoUrl ? photoKeyFromUrl(existing.photoUrl) : undefined;
  if (previousKey) {
    // The new photo is already live; failing to clean up the previous
    // object must not fail this request. Log it and continue.
    try {
      await storage.remove(previousKey);
    } catch (error) {
      log.error({ err: error, placeId: id }, 'failed to delete previous place photo');
    }
  }

  return getById(id);
};
