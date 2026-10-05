import { and, desc, eq, gte, inArray, lte, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { db } from '../../db/client';
import { cities, lessonExceptions, lessons, places, rabbis } from '../../db/schema';
import { UPCOMING_OCCURRENCE_WINDOW_DAYS } from '../lesson/consts';
import { addDays, todayInIsrael } from '../lesson/israel-time';
import { applyException, compareOccurrences, expandLesson, resolveRecord, toExceptionDomain, toLessonDomain } from '../lesson/occurrence';
import { dismissImportKey } from '../shared/dismiss-import';
import { provenanceAfterHandEdit } from '../shared/hand-edit';
import { baseLessonQuery, lessonColumnsFrom, toLessonWriteRecord, verifyReferences } from '../shared/lesson-write';
import { toRabbiSummary as toRabbi } from '../shared/rabbi-summary';
import { LessonNotFoundError, ReferencedPlaceNotFoundError, ReferencedRabbiNotFoundError, UnknownCityError } from './errors';
import type { AdminOccurrenceListResult, CreateLessonInput, LessonListQuery, LessonListResult, LessonRecord, UpdateLessonInput } from './models';

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

  // One query for the page's rabbis, joined in memory. `lessons.rabbi_id` is a
  // non-null foreign key, so a miss means a broken invariant: fail loudly
  // rather than send a lesson without its rabbi.
  const rabbiIds = [...new Set(rows.map((row) => row.rabbiId))];
  const rabbiRows = rabbiIds.length ? await db.select().from(rabbis).where(inArray(rabbis.id, rabbiIds)) : [];
  const rabbiById = new Map(rabbiRows.map((row) => [row.id, toRabbi(row)] as const));

  const items = rows.map((row) => {
    const rabbi = rabbiById.get(row.rabbiId);
    if (!rabbi) throw new Error(`lesson '${row.id}' references rabbi '${row.rabbiId}', which does not exist`);
    return { ...toLessonWriteRecord(row), rabbi };
  });

  return { items, page: query.page, pageSize: query.pageSize, total: totalRows[0]?.count ?? 0 };
};

export const getById = async (id: string): Promise<LessonRecord> => {
  const rows = await baseLessonQuery().where(eq(lessons.id, id)).limit(1);
  const row = rows[0];
  if (!row) throw new LessonNotFoundError(id);
  return toLessonWriteRecord(row);
};

const onPlaceNotFound = (placeId: string): Error => new ReferencedPlaceNotFoundError(placeId);

export const create = async (input: CreateLessonInput): Promise<LessonRecord> => {
  await verifyReferences({
    rabbiId: input.rabbiId,
    cityCode: input.venue.kind === 'address' ? input.venue.cityCode : undefined,
    audience: input.audience,
    onUnknownCity: (cityCode) => new UnknownCityError(cityCode),
    onReferencedRabbiNotFound: (rabbiId) => new ReferencedRabbiNotFoundError(rabbiId),
  });

  const [row] = await db
    .insert(lessons)
    .values({ id: nanoid(), rabbiId: input.rabbiId, ...(await lessonColumnsFrom(input, { onPlaceNotFound })) })
    .returning({ id: lessons.id });
  if (!row) throw new Error('insert into lessons returned no row');
  return getById(row.id);
};

export const update = async (id: string, input: UpdateLessonInput): Promise<LessonRecord> => {
  await verifyReferences({
    rabbiId: input.rabbiId,
    cityCode: input.venue.kind === 'address' ? input.venue.cityCode : undefined,
    audience: input.audience,
    onUnknownCity: (cityCode) => new UnknownCityError(cityCode),
    onReferencedRabbiNotFound: (rabbiId) => new ReferencedRabbiNotFoundError(rabbiId),
  });

  const existingRows = await db.select({ provenance: lessons.provenance }).from(lessons).where(eq(lessons.id, id)).limit(1);
  const existing = existingRows[0];
  if (!existing) throw new LessonNotFoundError(id);

  const [row] = await db
    .update(lessons)
    .set({
      ...(await lessonColumnsFrom(input, { onPlaceNotFound })),
      rabbiId: input.rabbiId,
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

  const [rabbiRows, cityRows, placeRows, exceptionRows] = await Promise.all([
    db.select().from(rabbis),
    db.select({ code: cities.code, nameHe: cities.nameHe, area: cities.area }).from(cities),
    db.select().from(places),
    db
      .select()
      .from(lessonExceptions)
      .where(and(eq(lessonExceptions.lessonId, lessonId), gte(lessonExceptions.date, from), lte(lessonExceptions.date, to))),
  ]);

  const rabbiById = new Map(rabbiRows.map((row) => [row.id, toRabbi(row)] as const));
  const cityByCode = new Map(cityRows.map((row) => [row.code, row] as const));
  const placeById = new Map(placeRows.map((row) => [row.id, row] as const));
  const exceptionByKey = new Map(exceptionRows.map((row) => [`${row.lessonId}:${row.date}`, toExceptionDomain(row)] as const));

  const occurrences = expandLesson(toLessonDomain(lessonRow), from, to)
    .map((raw) => applyException(raw, exceptionByKey.get(`${raw.lesson.id}:${raw.date}`)))
    .sort(compareOccurrences);

  return { items: occurrences.map((occurrence) => resolveRecord(occurrence, rabbiById, cityByCode, placeById)) };
};
