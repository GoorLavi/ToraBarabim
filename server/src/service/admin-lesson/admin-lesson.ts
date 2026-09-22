import type { LessonAudience, Weekday } from '@torabarabim/common';
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { db } from '../../db/client';
import { cities, lessonExceptions, lessons, rabbis } from '../../db/schema';
import { UPCOMING_OCCURRENCE_WINDOW_DAYS } from '../lesson/consts';
import { addDays, todayInIsrael } from '../lesson/israel-time';
import { applyException, compareOccurrences, expandLesson, resolveRecord, toExceptionDomain, toLessonDomain } from '../lesson/occurrence';
import { dismissImportKey } from '../shared/dismiss-import';
import { provenanceAfterHandEdit } from '../shared/hand-edit';
import { assertAudienceAllowedForHonorific, getRabbiHonorific } from '../shared/rabbanit-guard';
import { toRabbiSummary as toRabbi } from '../shared/rabbi-summary';
import { LessonNotFoundError, ReferencedRabbiNotFoundError, UnknownCityError } from './errors';
import type { AdminOccurrenceListResult, CreateLessonInput, LessonListQuery, LessonListResult, LessonRecord, UpdateLessonInput } from './models';

// A lesson's `cityCode` always resolves (the column is `NOT NULL` and
// references `cities.code`), so an inner join never drops a row.
const lessonSelection = {
  id: lessons.id,
  title: lessons.title,
  rabbiId: lessons.rabbiId,
  addressName: lessons.addressName,
  addressStreet: lessons.addressStreet,
  addressFloor: lessons.addressFloor,
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
  provenance: lessons.provenance,
  updatedAt: lessons.updatedAt,
};

const baseLessonQuery = () => db.select(lessonSelection).from(lessons).innerJoin(cities, eq(lessons.cityCode, cities.code));

type JoinedLessonRow = Awaited<ReturnType<typeof baseLessonQuery>>[number];

const toRecord = (row: JoinedLessonRow): LessonRecord => ({
  id: row.id,
  title: row.title ?? undefined,
  rabbiId: row.rabbiId,
  place: {
    name: row.addressName,
    street: row.addressStreet,
    floor: row.addressFloor ?? undefined,
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
  provenance: row.provenance,
});

// Verifies the rabbi and city references exist, and that a rabbanit is
// never assigned a lesson whose audience is not 'women'.
const verifyReferences = async (rabbiId: string, cityCode: number, audience: LessonAudience): Promise<void> => {
  const [honorific, cityRows] = await Promise.all([
    getRabbiHonorific(rabbiId),
    db.select({ code: cities.code }).from(cities).where(eq(cities.code, cityCode)).limit(1),
  ]);
  if (honorific === undefined) throw new ReferencedRabbiNotFoundError(rabbiId);
  if (!cityRows[0]) throw new UnknownCityError(cityCode);
  assertAudienceAllowedForHonorific(honorific, rabbiId, audience);
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
  await verifyReferences(input.rabbiId, input.place.cityCode, input.audience);

  const [row] = await db
    .insert(lessons)
    .values({
      id: nanoid(),
      title: input.title,
      rabbiId: input.rabbiId,
      addressName: input.place.name,
      addressStreet: input.place.street,
      addressFloor: input.place.floor,
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
  await verifyReferences(input.rabbiId, input.place.cityCode, input.audience);

  const existingRows = await db.select({ provenance: lessons.provenance }).from(lessons).where(eq(lessons.id, id)).limit(1);
  const existing = existingRows[0];
  if (!existing) throw new LessonNotFoundError(id);

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
      addressName: input.place.name,
      addressStreet: input.place.street,
      addressFloor: input.place.floor ?? null,
      cityCode: input.place.cityCode,
      topic: input.topic,
      audience: input.audience,
      recurrenceKind: input.recurrence.kind,
      recurrenceWeekdays: input.recurrence.kind === 'weekly' ? input.recurrence.weekdays : null,
      recurrenceDate: input.recurrence.kind === 'once' ? input.recurrence.date : null,
      startTime: input.startTime,
      durationMinutes: input.durationMinutes,
      notes: input.notes ?? null,
      provenance: provenanceAfterHandEdit(existing.provenance),
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
    const rows = await tx.select({ id: lessons.id, importKey: lessons.importKey }).from(lessons).where(eq(lessons.id, id)).limit(1);
    const row = rows[0];
    if (!row) throw new LessonNotFoundError(id);

    await tx.delete(lessonExceptions).where(eq(lessonExceptions.lessonId, id));
    await tx.delete(lessons).where(eq(lessons.id, id));
    await dismissImportKey(row.importKey, tx);
  });
};

// One lesson's recurrence rule expanded across the same fixed window a
// rabbi's own upcoming occurrences uses (`UPCOMING_OCCURRENCE_WINDOW_DAYS`),
// so an admin sees exactly what a cancel or a move on this lesson would
// act on. Reuses `expandLesson`/`applyException`/`resolveRecord`, per the
// house rule on the recurrence expansion: a third hand-rolled copy is
// exactly what that rule exists to prevent.
export const listOccurrencesForLesson = async (lessonId: string, now: Date): Promise<AdminOccurrenceListResult> => {
  const [lessonRow] = await db.select().from(lessons).where(eq(lessons.id, lessonId)).limit(1);
  if (!lessonRow) throw new LessonNotFoundError(lessonId);

  const from = todayInIsrael(now);
  const to = addDays(from, UPCOMING_OCCURRENCE_WINDOW_DAYS - 1);

  const [rabbiRows, cityRows, exceptionRows] = await Promise.all([
    db.select().from(rabbis),
    db.select({ code: cities.code, nameHe: cities.nameHe, area: cities.area }).from(cities),
    db
      .select()
      .from(lessonExceptions)
      .where(and(eq(lessonExceptions.lessonId, lessonId), gte(lessonExceptions.date, from), lte(lessonExceptions.date, to))),
  ]);

  const rabbiById = new Map(rabbiRows.map((row) => [row.id, toRabbi(row)] as const));
  const cityByCode = new Map(cityRows.map((row) => [row.code, row] as const));
  const exceptionByKey = new Map(exceptionRows.map((row) => [`${row.lessonId}:${row.date}`, toExceptionDomain(row)] as const));

  const occurrences = expandLesson(toLessonDomain(lessonRow), from, to)
    .map((raw) => applyException(raw, exceptionByKey.get(`${raw.lesson.id}:${raw.date}`)))
    .sort(compareOccurrences);

  return { items: occurrences.map((occurrence) => resolveRecord(occurrence, rabbiById, cityByCode)) };
};
