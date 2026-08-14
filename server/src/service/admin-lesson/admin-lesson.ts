import type { Weekday } from '@torabarabim/common';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { db } from '../../db/client';
import { lessonExceptions, lessons, places, rabbis } from '../../db/schema';
import { LessonNotFoundError, ReferencedPlaceNotFoundError, ReferencedRabbiNotFoundError } from './errors';
import type { CreateLessonInput, LessonListQuery, LessonListResult, LessonRecord, UpdateLessonInput } from './models';

type LessonRow = typeof lessons.$inferSelect;

const toRecord = (row: LessonRow): LessonRecord => ({
  id: row.id,
  title: row.title ?? undefined,
  rabbiId: row.rabbiId,
  placeId: row.placeId,
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

const verifyReferences = async (rabbiId: string, placeId: string): Promise<void> => {
  const [rabbiRows, placeRows] = await Promise.all([
    db.select({ id: rabbis.id }).from(rabbis).where(eq(rabbis.id, rabbiId)).limit(1),
    db.select({ id: places.id }).from(places).where(eq(places.id, placeId)).limit(1),
  ]);
  if (!rabbiRows[0]) throw new ReferencedRabbiNotFoundError(rabbiId);
  if (!placeRows[0]) throw new ReferencedPlaceNotFoundError(placeId);
};

export const list = async (query: LessonListQuery): Promise<LessonListResult> => {
  const eligiblePlaceIds =
    query.cityId !== undefined
      ? (await db.select({ id: places.id }).from(places).where(eq(places.cityId, query.cityId))).map((row) => row.id)
      : undefined;

  if (eligiblePlaceIds?.length === 0) {
    return { items: [], page: query.page, pageSize: query.pageSize, total: 0 };
  }

  const conditions = [
    query.rabbiId ? eq(lessons.rabbiId, query.rabbiId) : undefined,
    query.placeId ? eq(lessons.placeId, query.placeId) : undefined,
    eligiblePlaceIds ? inArray(lessons.placeId, eligiblePlaceIds) : undefined,
  ].filter((condition) => condition !== undefined);
  const whereClause = conditions.length ? and(...conditions) : undefined;

  const [rows, totalRows] = await Promise.all([
    db
      .select()
      .from(lessons)
      .where(whereClause)
      .orderBy(desc(lessons.updatedAt))
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize),
    db.select({ count: sql<number>`count(*)::int` }).from(lessons).where(whereClause),
  ]);

  return { items: rows.map(toRecord), page: query.page, pageSize: query.pageSize, total: totalRows[0]?.count ?? 0 };
};

export const getById = async (id: string): Promise<LessonRecord> => {
  const rows = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  const row = rows[0];
  if (!row) throw new LessonNotFoundError(id);
  return toRecord(row);
};

export const create = async (input: CreateLessonInput): Promise<LessonRecord> => {
  await verifyReferences(input.rabbiId, input.placeId);

  const [row] = await db
    .insert(lessons)
    .values({
      id: nanoid(),
      title: input.title,
      rabbiId: input.rabbiId,
      placeId: input.placeId,
      topic: input.topic,
      audience: input.audience,
      recurrenceKind: input.recurrence.kind,
      recurrenceWeekdays: input.recurrence.kind === 'weekly' ? input.recurrence.weekdays : null,
      recurrenceDate: input.recurrence.kind === 'once' ? input.recurrence.date : null,
      startTime: input.startTime,
      durationMinutes: input.durationMinutes,
      notes: input.notes,
    })
    .returning();
  if (!row) throw new Error('insert into lessons returned no row');
  return toRecord(row);
};

export const update = async (id: string, input: UpdateLessonInput): Promise<LessonRecord> => {
  await verifyReferences(input.rabbiId, input.placeId);

  const [row] = await db
    .update(lessons)
    .set({
      title: input.title,
      rabbiId: input.rabbiId,
      placeId: input.placeId,
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
    .returning();
  if (!row) throw new LessonNotFoundError(id);
  return toRecord(row);
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
