import type { Weekday } from '@torabarabim/common';
import { and, desc, eq, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { db } from '../../db/client';
import { cities, lessonExceptions, lessons, rabbis } from '../../db/schema';
import { LessonNotFoundError, ReferencedRabbiNotFoundError, UnknownCityError } from './errors';
import type { CreateLessonInput, LessonListQuery, LessonListResult, LessonRecord, UpdateLessonInput } from './models';

// A lesson's `cityCode` always resolves (the column is `NOT NULL` and
// references `cities.code`), so an inner join never drops a row.
const lessonSelection = {
  id: lessons.id,
  title: lessons.title,
  rabbiId: lessons.rabbiId,
  placeName: lessons.placeName,
  placeStreet: lessons.placeStreet,
  placeFloor: lessons.placeFloor,
  cityCode: lessons.cityCode,
  cityName: cities.nameHe,
  topic: lessons.topic,
  audience: lessons.audience,
  recurrenceKind: lessons.recurrenceKind,
  recurrenceWeekdays: lessons.recurrenceWeekdays,
  recurrenceDate: lessons.recurrenceDate,
  startTime: lessons.startTime,
  durationMinutes: lessons.durationMinutes,
  notes: lessons.notes,
  updatedAt: lessons.updatedAt,
};

const baseLessonQuery = () => db.select(lessonSelection).from(lessons).innerJoin(cities, eq(lessons.cityCode, cities.code));

type JoinedLessonRow = Awaited<ReturnType<typeof baseLessonQuery>>[number];

const toRecord = (row: JoinedLessonRow): LessonRecord => ({
  id: row.id,
  title: row.title ?? undefined,
  rabbiId: row.rabbiId,
  place: {
    name: row.placeName,
    street: row.placeStreet,
    floor: row.placeFloor ?? undefined,
    cityCode: row.cityCode,
    cityName: row.cityName,
  },
  topic: row.topic ?? undefined,
  audience: row.audience,
  // The `lessons_recurrence_shape` check constraint guarantees weekdays is
  // set for 'weekly' and date is set for 'once'; TS cannot see a DB constraint.
  recurrence:
    row.recurrenceKind === 'weekly'
      ? { kind: 'weekly', weekdays: row.recurrenceWeekdays as Weekday[] }
      : { kind: 'once', date: row.recurrenceDate as string },
  startTime: row.startTime,
  durationMinutes: row.durationMinutes,
  notes: row.notes ?? undefined,
});

const verifyReferences = async (rabbiId: string, cityCode: number): Promise<void> => {
  const [rabbiRows, cityRows] = await Promise.all([
    db.select({ id: rabbis.id }).from(rabbis).where(eq(rabbis.id, rabbiId)).limit(1),
    db.select({ code: cities.code }).from(cities).where(eq(cities.code, cityCode)).limit(1),
  ]);
  if (!rabbiRows[0]) throw new ReferencedRabbiNotFoundError(rabbiId);
  if (!cityRows[0]) throw new UnknownCityError(cityCode);
};

export const list = async (query: LessonListQuery): Promise<LessonListResult> => {
  const conditions = [
    query.rabbiId ? eq(lessons.rabbiId, query.rabbiId) : undefined,
    query.cityId !== undefined ? eq(lessons.cityCode, query.cityId) : undefined,
  ].filter((condition) => condition !== undefined);
  const whereClause = conditions.length ? and(...conditions) : undefined;

  const [rows, totalRows] = await Promise.all([
    baseLessonQuery().where(whereClause).orderBy(desc(lessons.updatedAt)).limit(query.pageSize).offset((query.page - 1) * query.pageSize),
    db.select({ count: sql<number>`count(*)::int` }).from(lessons).where(whereClause),
  ]);

  return { items: rows.map(toRecord), page: query.page, pageSize: query.pageSize, total: totalRows[0]?.count ?? 0 };
};

export const getById = async (id: string): Promise<LessonRecord> => {
  const rows = await baseLessonQuery().where(eq(lessons.id, id)).limit(1);
  const row = rows[0];
  if (!row) throw new LessonNotFoundError(id);
  return toRecord(row);
};

export const create = async (input: CreateLessonInput): Promise<LessonRecord> => {
  await verifyReferences(input.rabbiId, input.place.cityCode);

  const [row] = await db
    .insert(lessons)
    .values({
      id: nanoid(),
      title: input.title,
      rabbiId: input.rabbiId,
      placeName: input.place.name,
      placeStreet: input.place.street,
      placeFloor: input.place.floor,
      cityCode: input.place.cityCode,
      topic: input.topic,
      audience: input.audience,
      recurrenceKind: input.recurrence.kind,
      recurrenceWeekdays: input.recurrence.kind === 'weekly' ? input.recurrence.weekdays : null,
      recurrenceDate: input.recurrence.kind === 'once' ? input.recurrence.date : null,
      startTime: input.startTime,
      durationMinutes: input.durationMinutes,
      notes: input.notes,
    })
    .returning({ id: lessons.id });
  if (!row) throw new Error('insert into lessons returned no row');
  return getById(row.id);
};

export const update = async (id: string, input: UpdateLessonInput): Promise<LessonRecord> => {
  await verifyReferences(input.rabbiId, input.place.cityCode);

  const [row] = await db
    .update(lessons)
    .set({
      // `?? null` on every optional field: this is a full-replacement
      // update (see `updateLessonSchema`'s comment), so an omitted field
      // must clear the column, not leave a stale value in place. Drizzle
      // skips a column entirely when its `.set()` value is `undefined`,
      // which would otherwise silently keep whatever was there before.
      title: input.title ?? null,
      rabbiId: input.rabbiId,
      placeName: input.place.name,
      placeStreet: input.place.street,
      placeFloor: input.place.floor ?? null,
      cityCode: input.place.cityCode,
      topic: input.topic,
      audience: input.audience,
      recurrenceKind: input.recurrence.kind,
      recurrenceWeekdays: input.recurrence.kind === 'weekly' ? input.recurrence.weekdays : null,
      recurrenceDate: input.recurrence.kind === 'once' ? input.recurrence.date : null,
      startTime: input.startTime,
      durationMinutes: input.durationMinutes,
      notes: input.notes ?? null,
      updatedAt: new Date(),
    })
    .where(eq(lessons.id, id))
    .returning({ id: lessons.id });
  if (!row) throw new LessonNotFoundError(id);
  return getById(row.id);
};

// Deleting a lesson deletes its own exceptions in the same transaction; no
// confirm flag, since the exceptions are part of the lesson, not a separate
// thing the admin might not expect to lose.
export const remove = async (id: string): Promise<void> => {
  await db.transaction(async (tx) => {
    const rows = await tx.select({ id: lessons.id }).from(lessons).where(eq(lessons.id, id)).limit(1);
    if (!rows[0]) throw new LessonNotFoundError(id);

    await tx.delete(lessonExceptions).where(eq(lessonExceptions.lessonId, id));
    await tx.delete(lessons).where(eq(lessons.id, id));
  });
};
