import type { LessonOccurrence as WireLessonOccurrence } from '@torabarabim/common';
import { and, desc, eq, gte, inArray, lte, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { db } from '../../db/client';
import { cities, lessonExceptions, lessons, rabbis } from '../../db/schema';
import { UPCOMING_OCCURRENCE_WINDOW_DAYS } from '../lesson/consts';
import { addDays, todayInIsrael } from '../lesson/israel-time';
import { applyException, compareOccurrences, expandLesson, resolveRecord, toExceptionDomain, toLessonDomain } from '../lesson/occurrence';
import { dismissImportKey } from '../shared/dismiss-import';
import { provenanceAfterHandEdit } from '../shared/hand-edit';
import { baseLessonQuery, lessonColumnsFrom, toLessonWriteRecord, verifyReferences } from '../shared/lesson-write';
import { toRabbiSummary as toRabbi } from '../shared/rabbi-summary';
import { LessonNotFoundError, UnknownCityError } from './errors';
import type { CreateRabbiLessonInput, RabbiLessonListQuery, RabbiLessonListResult, RabbiLessonRecord, UpdateRabbiLessonInput } from './models';

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

  return { items: rows.map(toLessonWriteRecord), page: query.page, pageSize: query.pageSize, total: totalRows[0]?.count ?? 0 };
};

export const getOwnById = async (rabbiId: string, id: string): Promise<RabbiLessonRecord> => {
  const rows = await baseLessonQuery().where(and(eq(lessons.id, id), eq(lessons.rabbiId, rabbiId))).limit(1);
  const row = rows[0];
  if (!row) throw new LessonNotFoundError(id);
  return toLessonWriteRecord(row);
};

export const create = async (rabbiId: string, input: CreateRabbiLessonInput): Promise<RabbiLessonRecord> => {
  await verifyReferences({
    rabbiId,
    cityCode: input.place.cityCode,
    audience: input.audience,
    onUnknownCity: (cityCode) => new UnknownCityError(cityCode),
  });

  const [row] = await db
    .insert(lessons)
    .values({ id: nanoid(), rabbiId, ...lessonColumnsFrom(input) })
    .returning({ id: lessons.id });
  if (!row) throw new Error('insert into lessons returned no row');
  return getOwnById(rabbiId, row.id);
};

export const update = async (rabbiId: string, id: string, input: UpdateRabbiLessonInput): Promise<RabbiLessonRecord> => {
  await verifyReferences({
    rabbiId,
    cityCode: input.place.cityCode,
    audience: input.audience,
    onUnknownCity: (cityCode) => new UnknownCityError(cityCode),
  });

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
      ...lessonColumnsFrom(input),
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
