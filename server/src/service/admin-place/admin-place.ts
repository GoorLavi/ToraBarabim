import { and, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { db } from '../../db/client';
import { cities, lessonExceptions, lessons, places } from '../../db/schema';
import { PlaceDeleteConfirmationRequiredError, PlaceNotFoundError, UnknownCityError } from './errors';
import type {
  CreatePlaceInput,
  DeletePlacePreviewResult,
  PlaceListQuery,
  PlaceListResult,
  PlaceRecord,
  UpdatePlaceInput,
} from './models';

// `%` and `_` are LIKE wildcards; escape them so a place name containing
// either cannot change what the search matches.
const escapeLikePattern = (value: string): string => value.replace(/[\\%_]/g, (char) => `\\${char}`);

type JoinedPlaceRow = {
  id: string;
  name: string;
  address: string;
  cityId: number;
  cityName: string;
  area: PlaceRecord['area'];
};

const toRecord = (row: JoinedPlaceRow): PlaceRecord => ({
  id: row.id,
  name: row.name,
  address: row.address,
  cityId: row.cityId,
  city: row.cityName,
  area: row.area,
});

const placeSelection = {
  id: places.id,
  name: places.name,
  address: places.address,
  cityId: places.cityId,
  cityName: cities.nameHe,
  area: cities.area,
};

const resolveCity = async (cityIdRaw: string): Promise<{ code: number; nameHe: string; area: PlaceRecord['area'] }> => {
  const code = Number(cityIdRaw);
  if (!Number.isInteger(code) || code <= 0) throw new UnknownCityError(cityIdRaw);

  const rows = await db.select().from(cities).where(eq(cities.code, code)).limit(1);
  const row = rows[0];
  if (!row) throw new UnknownCityError(cityIdRaw);
  return row;
};

export const list = async (query: PlaceListQuery): Promise<PlaceListResult> => {
  const conditions = [
    query.q ? ilike(places.name, `%${escapeLikePattern(query.q)}%`) : undefined,
    query.cityId !== undefined ? eq(places.cityId, query.cityId) : undefined,
  ].filter((condition) => condition !== undefined);
  const whereClause = conditions.length ? and(...conditions) : undefined;

  const [rows, totalRows] = await Promise.all([
    db
      .select(placeSelection)
      .from(places)
      .innerJoin(cities, eq(places.cityId, cities.code))
      .where(whereClause)
      .orderBy(desc(places.updatedAt))
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize),
    db.select({ count: sql<number>`count(*)::int` }).from(places).where(whereClause),
  ]);

  return { items: rows.map(toRecord), page: query.page, pageSize: query.pageSize, total: totalRows[0]?.count ?? 0 };
};

export const getById = async (id: string): Promise<PlaceRecord> => {
  const rows = await db.select(placeSelection).from(places).innerJoin(cities, eq(places.cityId, cities.code)).where(eq(places.id, id)).limit(1);
  const row = rows[0];
  if (!row) throw new PlaceNotFoundError(id);
  return toRecord(row);
};

export const create = async (input: CreatePlaceInput): Promise<PlaceRecord> => {
  const city = await resolveCity(input.cityId);
  const id = nanoid();

  await db.insert(places).values({ id, name: input.name, address: input.address, cityId: city.code });
  return getById(id);
};

export const update = async (id: string, input: UpdatePlaceInput): Promise<PlaceRecord> => {
  const city = input.cityId !== undefined ? await resolveCity(input.cityId) : undefined;

  const [row] = await db
    .update(places)
    .set({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.address !== undefined ? { address: input.address } : {}),
      ...(city ? { cityId: city.code } : {}),
      updatedAt: new Date(),
    })
    .where(eq(places.id, id))
    .returning({ id: places.id });
  if (!row) throw new PlaceNotFoundError(id);

  return getById(id);
};

export const getDeletePreview = async (id: string): Promise<DeletePlacePreviewResult> => {
  await getById(id);

  const [lessonCountRows, exceptionCountRows] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(lessons).where(eq(lessons.placeId, id)),
    db
      .select({ count: sql<number>`count(distinct ${lessonExceptions.id})::int` })
      .from(lessonExceptions)
      .leftJoin(lessons, eq(lessonExceptions.lessonId, lessons.id))
      .where(or(eq(lessons.placeId, id), eq(lessonExceptions.placeId, id))),
  ]);

  return {
    lessonCount: lessonCountRows[0]?.count ?? 0,
    exceptionCount: exceptionCountRows[0]?.count ?? 0,
  };
};

// Deleting a place destroys that place's lessons, those lessons' exceptions,
// and any other lesson's exception that overrode its place to this one, all
// in one transaction. Mirrors the rabbi cascade: the confirm flag on the
// route is the only thing standing in front of this data loss.
export const remove = async (id: string, confirm: boolean): Promise<void> => {
  const preview = await getDeletePreview(id);
  if (!confirm) {
    throw new PlaceDeleteConfirmationRequiredError(preview.lessonCount, preview.exceptionCount);
  }

  await db.transaction(async (tx) => {
    const ownLessons = await tx.select({ id: lessons.id }).from(lessons).where(eq(lessons.placeId, id));
    const ownLessonIds = ownLessons.map((row) => row.id);

    if (ownLessonIds.length) {
      await tx.delete(lessonExceptions).where(inArray(lessonExceptions.lessonId, ownLessonIds));
    }
    await tx.delete(lessonExceptions).where(eq(lessonExceptions.placeId, id));
    if (ownLessonIds.length) {
      await tx.delete(lessons).where(inArray(lessons.id, ownLessonIds));
    }
    await tx.delete(places).where(eq(places.id, id));
  });
};
