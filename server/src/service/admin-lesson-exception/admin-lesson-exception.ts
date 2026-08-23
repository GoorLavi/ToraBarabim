import type { Weekday } from '@torabarabim/common';
import { and, eq } from 'drizzle-orm';
import postgres from 'postgres';

import { db } from '../../db/client';
import { cities, lessonExceptions, lessons, rabbis } from '../../db/schema';
import { weekdayOf } from '../lesson/israel-time';
import {
  DateNotInRecurrenceError,
  DuplicateExceptionError,
  ExceptionNotFoundError,
  LessonNotFoundError,
  ReferencedRabbiNotFoundError,
  UnknownCityError,
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

// A left join, unlike the lesson's own city: a 'modified' exception's place
// override is optional, so its `cityCode` (and therefore `cityName`) is
// null whenever there is no override, not just when the row is 'cancelled'.
const exceptionSelection = {
  id: lessonExceptions.id,
  lessonId: lessonExceptions.lessonId,
  date: lessonExceptions.date,
  kind: lessonExceptions.kind,
  reason: lessonExceptions.reason,
  startTime: lessonExceptions.startTime,
  placeName: lessonExceptions.placeName,
  placeStreet: lessonExceptions.placeStreet,
  placeFloor: lessonExceptions.placeFloor,
  cityCode: lessonExceptions.cityCode,
  cityName: cities.nameHe,
  substituteRabbiId: lessonExceptions.substituteRabbiId,
  note: lessonExceptions.note,
};

const baseExceptionQuery = () =>
  db.select(exceptionSelection).from(lessonExceptions).leftJoin(cities, eq(lessonExceptions.cityCode, cities.code));

type JoinedExceptionRow = Awaited<ReturnType<typeof baseExceptionQuery>>[number];

const toRecord = (row: JoinedExceptionRow): LessonExceptionRecord =>
  row.kind === 'cancelled'
    ? { id: row.id, lessonId: row.lessonId, date: row.date, kind: 'cancelled', reason: row.reason ?? undefined }
    : {
        id: row.id,
        lessonId: row.lessonId,
        date: row.date,
        kind: 'modified',
        startTime: row.startTime ?? undefined,
        place:
          row.placeName !== null && row.placeStreet !== null && row.cityCode !== null && row.cityName !== null
            ? { name: row.placeName, street: row.placeStreet, floor: row.placeFloor ?? undefined, cityCode: row.cityCode, cityName: row.cityName }
            : undefined,
        substituteRabbiId: row.substituteRabbiId ?? undefined,
        note: row.note ?? undefined,
      };

const getResolvedById = async (id: number): Promise<LessonExceptionRecord> => {
  const rows = await baseExceptionQuery().where(eq(lessonExceptions.id, id)).limit(1);
  const row = rows[0];
  if (!row) throw new Error(`expected lesson exception '${id}' to exist right after being written`);
  return toRecord(row);
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

  const [rabbiRows, cityRows] = await Promise.all([
    input.substituteRabbiId
      ? db.select({ id: rabbis.id }).from(rabbis).where(eq(rabbis.id, input.substituteRabbiId)).limit(1)
      : Promise.resolve(undefined),
    input.place
      ? db.select({ code: cities.code }).from(cities).where(eq(cities.code, input.place.cityCode)).limit(1)
      : Promise.resolve(undefined),
  ]);

  if (input.substituteRabbiId && !rabbiRows?.[0]) throw new ReferencedRabbiNotFoundError(input.substituteRabbiId);
  if (input.place && !cityRows?.[0]) throw new UnknownCityError(input.place.cityCode);
};

export const listForLesson = async (lessonId: string): Promise<LessonExceptionRecord[]> => {
  await getLessonOrThrow(lessonId);
  const rows = await baseExceptionQuery().where(eq(lessonExceptions.lessonId, lessonId));
  return rows.map(toRecord);
};

// Every optional field is explicitly `null` when absent, never left as
// `undefined`: this is a full-replacement write (the caller always sends
// the whole exception, not a merge), and Drizzle's `.set()` skips a column
// entirely when its value is `undefined`, which on an update would
// silently keep whatever was there before instead of clearing it.
const insertValues = (lessonId: string, input: LessonExceptionInput) => ({
  lessonId,
  date: input.date,
  kind: input.kind,
  reason: input.kind === 'cancelled' ? (input.reason ?? null) : null,
  startTime: input.kind === 'modified' ? (input.startTime ?? null) : null,
  placeName: input.kind === 'modified' ? (input.place?.name ?? null) : null,
  placeStreet: input.kind === 'modified' ? (input.place?.street ?? null) : null,
  placeFloor: input.kind === 'modified' ? (input.place?.floor ?? null) : null,
  cityCode: input.kind === 'modified' ? (input.place?.cityCode ?? null) : null,
  substituteRabbiId: input.kind === 'modified' ? (input.substituteRabbiId ?? null) : null,
  note: input.kind === 'modified' ? (input.note ?? null) : null,
});

export const create = async (lessonId: string, input: LessonExceptionInput): Promise<LessonExceptionRecord> => {
  const lesson = await getLessonOrThrow(lessonId);
  assertDateInRecurrence(lesson, input.date);
  await verifyModifiedReferences(input);

  try {
    const [row] = await db.insert(lessonExceptions).values(insertValues(lessonId, input)).returning({ id: lessonExceptions.id });
    if (!row) throw new Error('insert into lesson_exceptions returned no row');
    return getResolvedById(row.id);
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
      .returning({ id: lessonExceptions.id });
    if (!row) throw new ExceptionNotFoundError(exceptionId, lessonId);
    return getResolvedById(row.id);
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
