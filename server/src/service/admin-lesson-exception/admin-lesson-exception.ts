import type { Weekday } from '@torabarabim/common';
import { and, eq } from 'drizzle-orm';
import postgres from 'postgres';

import { db } from '../../db/client';
import { lessonExceptions, lessons, places, rabbis } from '../../db/schema';
import { weekdayOf } from '../lesson/israel-time';
import {
  DateNotInRecurrenceError,
  DuplicateExceptionError,
  ExceptionNotFoundError,
  LessonNotFoundError,
  ReferencedPlaceNotFoundError,
  ReferencedRabbiNotFoundError,
} from './errors';
import type { LessonExceptionInput, LessonExceptionRecord } from './models';

const UNIQUE_VIOLATION = '23505';

// drizzle-orm's postgres-js driver wraps the driver error in its own
// `DrizzleQueryError`, with the real `PostgresError` (and its SQLSTATE
// `code`) on `.cause`, not on the thrown error itself.
const isUniqueViolation = (error: unknown): boolean => {
  const cause = error instanceof Error ? error.cause : undefined;
  return cause instanceof postgres.PostgresError && cause.code === UNIQUE_VIOLATION;
};

type ExceptionRow = typeof lessonExceptions.$inferSelect;

const toRecord = (row: ExceptionRow): LessonExceptionRecord =>
  row.kind === 'cancelled'
    ? { id: row.id, lessonId: row.lessonId, date: row.date, kind: 'cancelled', reason: row.reason ?? undefined }
    : {
        id: row.id,
        lessonId: row.lessonId,
        date: row.date,
        kind: 'modified',
        startTime: row.startTime ?? undefined,
        placeId: row.placeId ?? undefined,
        substituteRabbiId: row.substituteRabbiId ?? undefined,
        note: row.note ?? undefined,
      };

const getLessonOrThrow = async (lessonId: string) => {
  const rows = await db.select().from(lessons).where(eq(lessons.id, lessonId)).limit(1);
  const row = rows[0];
  if (!row) throw new LessonNotFoundError(lessonId);
  return row;
};

// Enforces the same rule the recurrence expansion itself follows: an
// exception can only override a date the lesson would actually occur on.
const assertDateInRecurrence = (lesson: Awaited<ReturnType<typeof getLessonOrThrow>>, date: string): void => {
  const inRecurrence =
    lesson.recurrenceKind === 'once'
      ? lesson.recurrenceDate === date
      : (lesson.recurrenceWeekdays as Weekday[] | null)?.includes(weekdayOf(date)) ?? false;

  if (!inRecurrence) throw new DateNotInRecurrenceError(lesson.id, date);
};

const verifyModifiedReferences = async (input: LessonExceptionInput): Promise<void> => {
  if (input.kind !== 'modified') return;

  const [rabbiRows, placeRows] = await Promise.all([
    input.substituteRabbiId
      ? db.select({ id: rabbis.id }).from(rabbis).where(eq(rabbis.id, input.substituteRabbiId)).limit(1)
      : Promise.resolve(undefined),
    input.placeId ? db.select({ id: places.id }).from(places).where(eq(places.id, input.placeId)).limit(1) : Promise.resolve(undefined),
  ]);

  if (input.substituteRabbiId && !rabbiRows?.[0]) throw new ReferencedRabbiNotFoundError(input.substituteRabbiId);
  if (input.placeId && !placeRows?.[0]) throw new ReferencedPlaceNotFoundError(input.placeId);
};

export const listForLesson = async (lessonId: string): Promise<LessonExceptionRecord[]> => {
  await getLessonOrThrow(lessonId);
  const rows = await db.select().from(lessonExceptions).where(eq(lessonExceptions.lessonId, lessonId));
  return rows.map(toRecord);
};

const insertValues = (lessonId: string, input: LessonExceptionInput) => ({
  lessonId,
  date: input.date,
  kind: input.kind,
  reason: input.kind === 'cancelled' ? input.reason : null,
  startTime: input.kind === 'modified' ? input.startTime : null,
  placeId: input.kind === 'modified' ? input.placeId : null,
  substituteRabbiId: input.kind === 'modified' ? input.substituteRabbiId : null,
  note: input.kind === 'modified' ? input.note : null,
});

export const create = async (lessonId: string, input: LessonExceptionInput): Promise<LessonExceptionRecord> => {
  const lesson = await getLessonOrThrow(lessonId);
  assertDateInRecurrence(lesson, input.date);
  await verifyModifiedReferences(input);

  try {
    const [row] = await db.insert(lessonExceptions).values(insertValues(lessonId, input)).returning();
    if (!row) throw new Error('insert into lesson_exceptions returned no row');
    return toRecord(row);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new DuplicateExceptionError(lessonId, input.date);
    }
    throw error;
  }
};

export const update = async (lessonId: string, exceptionId: number, input: LessonExceptionInput): Promise<LessonExceptionRecord> => {
  const lesson = await getLessonOrThrow(lessonId);
  assertDateInRecurrence(lesson, input.date);
  await verifyModifiedReferences(input);

  try {
    const [row] = await db
      .update(lessonExceptions)
      .set({ ...insertValues(lessonId, input), updatedAt: new Date() })
      .where(and(eq(lessonExceptions.id, exceptionId), eq(lessonExceptions.lessonId, lessonId)))
      .returning();
    if (!row) throw new ExceptionNotFoundError(exceptionId, lessonId);
    return toRecord(row);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new DuplicateExceptionError(lessonId, input.date);
    }
    throw error;
  }
};

export const remove = async (lessonId: string, exceptionId: number): Promise<void> => {
  await getLessonOrThrow(lessonId);
  const [row] = await db
    .delete(lessonExceptions)
    .where(and(eq(lessonExceptions.id, exceptionId), eq(lessonExceptions.lessonId, lessonId)))
    .returning({ id: lessonExceptions.id });
  if (!row) throw new ExceptionNotFoundError(exceptionId, lessonId);
};
