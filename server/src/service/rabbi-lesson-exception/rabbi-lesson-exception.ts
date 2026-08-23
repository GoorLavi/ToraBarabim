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

const isUniqueViolation = (error: unknown): boolean => {
  const cause = error instanceof Error ? error.cause : undefined;
  return cause instanceof postgres.PostgresError && cause.code === UNIQUE_VIOLATION;
};

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

// Scoped to the authenticated rabbi's own lessons: a lesson that exists but
// belongs to another rabbi throws the same `LessonNotFoundError` as one
// that does not exist at all.
const getOwnLessonOrThrow = async (rabbiId: string, lessonId: string) => {
  const rows = await db
    .select()
    .from(lessons)
    .where(and(eq(lessons.id, lessonId), eq(lessons.rabbiId, rabbiId)))
    .limit(1);
  const row = rows[0];
  if (!row) throw new LessonNotFoundError(lessonId);
  return row;
};

const assertDateInRecurrence = (lesson: Awaited<ReturnType<typeof getOwnLessonOrThrow>>, date: string): void => {
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

export const listForOwnLesson = async (rabbiId: string, lessonId: string): Promise<LessonExceptionRecord[]> => {
  await getOwnLessonOrThrow(rabbiId, lessonId);
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

export const create = async (rabbiId: string, lessonId: string, input: LessonExceptionInput): Promise<LessonExceptionRecord> => {
  const lesson = await getOwnLessonOrThrow(rabbiId, lessonId);
  assertDateInRecurrence(lesson, input.date);
  await verifyModifiedReferences(input);

  try {
    const [row] = await db.insert(lessonExceptions).values(insertValues(lessonId, input)).returning({ id: lessonExceptions.id });
    if (!row) throw new Error('insert into lesson_exceptions returned no row');
    return getResolvedById(row.id);
  } catch (error) {
    if (isUniqueViolation(error)) throw new DuplicateExceptionError(lessonId, input.date);
    throw error;
  }
};

export const update = async (
  rabbiId: string,
  lessonId: string,
  exceptionId: number,
  input: LessonExceptionInput,
): Promise<LessonExceptionRecord> => {
  const lesson = await getOwnLessonOrThrow(rabbiId, lessonId);
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
    if (isUniqueViolation(error)) throw new DuplicateExceptionError(lessonId, input.date);
    throw error;
  }
};

export const remove = async (rabbiId: string, lessonId: string, exceptionId: number): Promise<void> => {
  await getOwnLessonOrThrow(rabbiId, lessonId);
  const [row] = await db
    .delete(lessonExceptions)
    .where(and(eq(lessonExceptions.id, exceptionId), eq(lessonExceptions.lessonId, lessonId)))
    .returning({ id: lessonExceptions.id });
  if (!row) throw new ExceptionNotFoundError(exceptionId, lessonId);
};
