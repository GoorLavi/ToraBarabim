import type { LessonOccurrence as WireLessonOccurrence, Weekday } from '@torabarabim/common';
import { and, desc, eq, gte, inArray, lte, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { db } from '../../db/client';
import { cities, lessonExceptions, lessons, rabbis } from '../../db/schema';
import { UPCOMING_OCCURRENCE_WINDOW_DAYS } from '../lesson/consts';
import { addDays, todayInIsrael } from '../lesson/israel-time';
import { applyException, compareOccurrences, expandLesson, resolveRecord, toExceptionDomain, toLessonDomain } from '../lesson/occurrence';
import { dismissImportKey } from '../shared/dismiss-import';
import { provenanceAfterHandEdit } from '../shared/hand-edit';
import { assertAudienceAllowedForRabbi } from '../shared/rabbanit-guard';
import { toRabbiSummary as toRabbi } from '../shared/rabbi-summary';
import { LessonNotFoundError, UnknownCityError } from './errors';
import type { CreateRabbiLessonInput, RabbiLessonListQuery, RabbiLessonListResult, RabbiLessonRecord, UpdateRabbiLessonInput } from './models';

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

const toRecord = (row: JoinedLessonRow): RabbiLessonRecord => ({
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

const verifyCity = async (cityCode: number): Promise<void> => {
  const rows = await db.select({ code: cities.code }).from(cities).where(eq(cities.code, cityCode)).limit(1);
  if (!rows[0]) throw new UnknownCityError(cityCode);
};

export const list = async (rabbiId: string, query: RabbiLessonListQuery): Promise<RabbiLessonListResult> => {
  const whereClause = eq(lessons.rabbiId, rabbiId);

  const [rows, totalRows] = await Promise.all([
    baseLessonQuery()
      .where(whereClause)
      .orderBy(desc(lessons.updatedAt))
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize),
    db.select({ count: sql<number>`count(*)::int` }).from(lessons).where(whereClause),
  ]);

  return { items: rows.map(toRecord), page: query.page, pageSize: query.pageSize, total: totalRows[0]?.count ?? 0 };
};

export const getOwnById = async (rabbiId: string, id: string): Promise<RabbiLessonRecord> => {
  const rows = await baseLessonQuery().where(and(eq(lessons.id, id), eq(lessons.rabbiId, rabbiId))).limit(1);
  const row = rows[0];
  if (!row) throw new LessonNotFoundError(id);
  return toRecord(row);
};

export const create = async (rabbiId: string, input: CreateRabbiLessonInput): Promise<RabbiLessonRecord> => {
  await Promise.all([verifyCity(input.place.cityCode), assertAudienceAllowedForRabbi(rabbiId, input.audience)]);

  const [row] = await db
    .insert(lessons)
    .values({
      id: nanoid(),
      title: input.title,
      rabbiId,
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
  return getOwnById(rabbiId, row.id);
};

export const update = async (rabbiId: string, id: string, input: UpdateRabbiLessonInput): Promise<RabbiLessonRecord> => {
  await Promise.all([verifyCity(input.place.cityCode), assertAudienceAllowedForRabbi(rabbiId, input.audience)]);

  const existingRows = await db
    .select({ provenance: lessons.provenance })
    .from(lessons)
    .where(and(eq(lessons.id, id), eq(lessons.rabbiId, rabbiId)))
    .limit(1);
  const existing = existingRows[0];
  if (!existing) throw new LessonNotFoundError(id);

  const [row] = await db
    .update(lessons)
    .set({
      // `?? null` on every optional field: this is a full-replacement
      // update, so an omitted field must clear the column, not leave a
      // stale value in place. Drizzle skips a column entirely when its
      // `.set()` value is `undefined`, which would otherwise silently
      // keep whatever was there before.
      title: input.title ?? null,
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
    .where(and(eq(lessons.id, id), eq(lessons.rabbiId, rabbiId)))
    .returning({ id: lessons.id });
  if (!row) throw new LessonNotFoundError(id);
  return getOwnById(rabbiId, row.id);
};

// Deleting a lesson deletes its own exceptions in the same transaction,
// matching the admin delete: the exceptions are part of the lesson, not a
// separate thing the rabbi might not expect to lose.
export const remove = async (rabbiId: string, id: string): Promise<void> => {
  await db.transaction(async (tx) => {
    const rows = await tx
      .select({ id: lessons.id, importKey: lessons.importKey })
      .from(lessons)
      .where(and(eq(lessons.id, id), eq(lessons.rabbiId, rabbiId)))
      .limit(1);
    const row = rows[0];
    if (!row) throw new LessonNotFoundError(id);

    await tx.delete(lessonExceptions).where(eq(lessonExceptions.lessonId, id));
    await tx.delete(lessons).where(eq(lessons.id, id));
    await dismissImportKey(row.importKey, tx);
  });
};

// Reuses the same recurrence-expansion primitives (`expandLesson`,
// `applyException`, `resolveRecord`) as the public search and the home
// page, rather than a second copy of the recurrence maths, per the house
// rule on the recurrence expansion.
export const listUpcomingOccurrences = async (rabbiId: string, now: Date): Promise<WireLessonOccurrence[]> => {
  const from = todayInIsrael(now);
  // `expandLesson` treats `to` as inclusive, so the last day of the window
  // is `UPCOMING_OCCURRENCE_WINDOW_DAYS - 1` days after today for a window
  // that counts today, matching `home.ts`'s `HOME_WINDOW_DAYS` convention.
  const to = addDays(from, UPCOMING_OCCURRENCE_WINDOW_DAYS - 1);

  const [rabbiRows, cityRows, lessonRows] = await Promise.all([
    db.select().from(rabbis),
    db.select({ code: cities.code, nameHe: cities.nameHe, area: cities.area }).from(cities),
    db.select().from(lessons).where(eq(lessons.rabbiId, rabbiId)),
  ]);

  const rabbiById = new Map(rabbiRows.map((row) => [row.id, toRabbi(row)] as const));
  const cityByCode = new Map(cityRows.map((row) => [row.code, row] as const));
  if (!rabbiById.has(rabbiId)) throw new Error(`data inconsistency: authenticated rabbi '${rabbiId}' has no rabbi row`);

  const lessonIds = lessonRows.map((row) => row.id);
  const exceptionRows = lessonIds.length
    ? await db
        .select()
        .from(lessonExceptions)
        .where(and(inArray(lessonExceptions.lessonId, lessonIds), gte(lessonExceptions.date, from), lte(lessonExceptions.date, to)))
    : [];
  const exceptionByKey = new Map(exceptionRows.map((row) => [`${row.lessonId}:${row.date}`, toExceptionDomain(row)] as const));

  const occurrences = lessonRows
    .map(toLessonDomain)
    .flatMap((lesson) => expandLesson(lesson, from, to))
    .map((raw) => applyException(raw, exceptionByKey.get(`${raw.lesson.id}:${raw.date}`)))
    .sort(compareOccurrences);

  return occurrences.map((occurrence) => resolveRecord(occurrence, rabbiById, cityByCode));
};
