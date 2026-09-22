import { and, desc, eq, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { db } from '../../db/client';
import { lessons } from '../../db/schema';
import { provenanceAfterHandEdit } from '../shared/hand-edit';
import { baseLessonQuery, lessonColumnsFrom, toLessonWriteRecord, verifyReferences } from '../shared/lesson-write';
import { LessonNotFoundError, ReferencedRabbiNotFoundError, UnknownCityError } from './errors';
import type { CreatePlaceLessonInput, PlaceLessonListQuery, PlaceLessonListResult, PlaceLessonRecord, UpdatePlaceLessonInput } from './models';

// A place lesson never carries an address arm, so `venue` is always
// `{ kind: 'place', placeId }`, built here from the session rather than
// trusted off the wire: see `createPlaceLessonSchema`'s `.strict()`.
const venueForPlace = (placeId: string) => ({ kind: 'place', placeId }) as const;

export const list = async (placeId: string, query: PlaceLessonListQuery): Promise<PlaceLessonListResult> => {
  const whereClause = eq(lessons.placeId, placeId);

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

export const getOwnById = async (placeId: string, id: string): Promise<PlaceLessonRecord> => {
  const rows = await baseLessonQuery()
    .where(and(eq(lessons.id, id), eq(lessons.placeId, placeId)))
    .limit(1);
  const row = rows[0];
  if (!row) throw new LessonNotFoundError(id);
  return toLessonWriteRecord(row);
};

export const create = async (placeId: string, input: CreatePlaceLessonInput): Promise<PlaceLessonRecord> => {
  // No `cityCode`: a place lesson never carries an address arm, so
  // `verifyReferences` never has a city of its own to check here. The
  // rabbi named on the wire is checked, and never assumed to be its own
  // session's, unlike `rabbi-lesson`'s writer: a place may name any rabbi
  // with no consent step (the owner's deliberate call). `getRabbiHonorific`
  // plus `assertAudienceAllowedForHonorific` runs either way, through
  // `onReferencedRabbiNotFound`, so a nonexistent rabbi id paired with
  // `audience: 'women'` is a clean `ReferencedRabbiNotFoundError`, never a
  // foreign-key error: `assertAudienceAllowedForRabbi` (the other arm of
  // `verifyReferences`) returns early on `audience === 'women'` without
  // ever checking the rabbi exists, which is safe only when the id comes
  // from a session, never off the wire the way it does here.
  await verifyReferences({
    rabbiId: input.rabbiId,
    audience: input.audience,
    onUnknownCity: (cityCode) => new UnknownCityError(cityCode),
    onReferencedRabbiNotFound: (rabbiId) => new ReferencedRabbiNotFoundError(rabbiId),
  });

  const columns = await lessonColumnsFrom({
    title: input.title,
    venue: venueForPlace(placeId),
    topic: input.topic,
    audience: input.audience,
    recurrence: input.recurrence,
    startTime: input.startTime,
    durationMinutes: input.durationMinutes,
    notes: input.notes,
  });

  const [row] = await db
    .insert(lessons)
    .values({ id: nanoid(), rabbiId: input.rabbiId, ...columns })
    .returning({ id: lessons.id });
  if (!row) throw new Error('insert into lessons returned no row');
  return getOwnById(placeId, row.id);
};

export const update = async (placeId: string, id: string, input: UpdatePlaceLessonInput): Promise<PlaceLessonRecord> => {
  await verifyReferences({
    rabbiId: input.rabbiId,
    audience: input.audience,
    onUnknownCity: (cityCode) => new UnknownCityError(cityCode),
    onReferencedRabbiNotFound: (rabbiId) => new ReferencedRabbiNotFoundError(rabbiId),
  });

  const existingRows = await db
    .select({ provenance: lessons.provenance })
    .from(lessons)
    .where(and(eq(lessons.id, id), eq(lessons.placeId, placeId)))
    .limit(1);
  const existing = existingRows[0];
  if (!existing) throw new LessonNotFoundError(id);

  const columns = await lessonColumnsFrom({
    title: input.title,
    venue: venueForPlace(placeId),
    topic: input.topic,
    audience: input.audience,
    recurrence: input.recurrence,
    startTime: input.startTime,
    durationMinutes: input.durationMinutes,
    notes: input.notes,
  });

  const [row] = await db
    .update(lessons)
    .set({
      ...columns,
      rabbiId: input.rabbiId,
      provenance: provenanceAfterHandEdit(existing.provenance),
      updatedAt: new Date(),
    })
    .where(and(eq(lessons.id, id), eq(lessons.placeId, placeId)))
    .returning({ id: lessons.id });
  if (!row) throw new LessonNotFoundError(id);
  return getOwnById(placeId, row.id);
};

// No `remove`: a place can create and edit a lesson but never delete one
// (the owner's deliberate call), and no route calls this file for it.
