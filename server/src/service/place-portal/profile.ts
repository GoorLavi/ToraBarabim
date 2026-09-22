import type { FastifyBaseLogger } from 'fastify';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { loadConfig } from '../../config';
import { db } from '../../db/client';
import { cities, places } from '../../db/schema';
import storage from '../../storage/storage';
import { validatePlacePhoto } from '../place/photo';
import { toSlug } from '../shared/slug';
import { PlaceNotFoundError, UnknownCityError } from './errors';
import type { PlaceProfileRecord, UpdatePlaceProfileInput } from './models';

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

const toRecord = (row: JoinedPlaceRow): PlaceProfileRecord => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  street: row.street,
  floor: row.floor ?? undefined,
  cityCode: row.cityCode,
  cityName: row.cityName,
  area: row.area,
  photoUrl: row.photoUrl ?? undefined,
});

const verifyCityExists = async (cityCode: number): Promise<void> => {
  const rows = await db.select({ code: cities.code }).from(cities).where(eq(cities.code, cityCode)).limit(1);
  if (!rows[0]) throw new UnknownCityError(cityCode);
};

export const getOwn = async (placeId: string): Promise<PlaceProfileRecord> => {
  const rows = await basePlaceQuery().where(eq(places.id, placeId)).limit(1);
  const row = rows[0];
  if (!row) throw new PlaceNotFoundError(placeId);
  return toRecord(row);
};

// A place edits its own profile in full, name and address included: the
// owner's deliberate call, since every lesson pointing at this place
// displays whatever this row currently holds (0016 reversed: a venue is a
// shared entity, not a per-lesson copy).
export const updateOwn = async (placeId: string, input: UpdatePlaceProfileInput): Promise<PlaceProfileRecord> => {
  if (input.cityCode !== undefined) await verifyCityExists(input.cityCode);

  const [row] = await db
    .update(places)
    .set({
      ...input,
      // `places`, unlike `rabbis`, stores its slug rather than deriving it
      // at read time (see `db/seed/places.ts`), so a rename must not leave
      // it stale. Recomputed only when the name actually changes.
      ...(input.name !== undefined ? { slug: toSlug(input.name) || placeId } : {}),
      updatedAt: new Date(),
    })
    .where(eq(places.id, placeId))
    .returning({ id: places.id });
  if (!row) throw new PlaceNotFoundError(placeId);
  return getOwn(placeId);
};

const photoKeyFromUrl = (photoUrl: string): string | undefined => {
  const { storagePublicBaseUrl } = loadConfig(process.env);
  const prefix = `${storagePublicBaseUrl}/`;
  return photoUrl.startsWith(prefix) ? photoUrl.slice(prefix.length) : undefined;
};

export const replaceOwnPhoto = async (placeId: string, bytes: Buffer, log: FastifyBaseLogger): Promise<PlaceProfileRecord> => {
  const { contentType, extension } = validatePlacePhoto(bytes);
  const existing = await getOwn(placeId);

  const key = `places/${placeId}/${nanoid()}.${extension}`;
  const url = await storage.put(key, bytes, contentType);

  const [row] = await db.update(places).set({ photoUrl: url, updatedAt: new Date() }).where(eq(places.id, placeId)).returning({ id: places.id });
  if (!row) throw new PlaceNotFoundError(placeId);

  const previousKey = existing.photoUrl ? photoKeyFromUrl(existing.photoUrl) : undefined;
  if (previousKey) {
    // The new photo is already live; failing to clean up the previous
    // object must not fail this request. Log it and continue.
    try {
      await storage.remove(previousKey);
    } catch (error) {
      log.error({ err: error, placeId }, 'failed to delete previous place photo');
    }
  }

  return getOwn(placeId);
};
