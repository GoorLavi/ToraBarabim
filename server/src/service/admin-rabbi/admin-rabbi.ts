import type { FastifyBaseLogger } from 'fastify';
import { desc, eq, ilike, inArray, or, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { loadConfig } from '../../config';
import { db } from '../../db/client';
import { courses, coursePhotos, lessonExceptions, lessons, rabbis } from '../../db/schema';
import storage from '../../storage/storage';
import { toRabbiSummary } from '../shared/rabbi-summary';
import { PhotoTooLargeError, RabbiDeleteConfirmationRequiredError, RabbiNotFoundError, UnsupportedPhotoTypeError } from './errors';
import type {
  CreateRabbiInput,
  DeleteRabbiPreviewResult,
  RabbiListQuery,
  RabbiListResult,
  RabbiRecord,
  UpdateRabbiInput,
} from './models';

// `%` and `_` are LIKE wildcards; escape them so a rabbi name containing
// either cannot change what the search matches.
const escapeLikePattern = (value: string): string => value.replace(/[\\%_]/g, (char) => `\\${char}`);

type RabbiRow = typeof rabbis.$inferSelect;

const toRecord = (row: RabbiRow): RabbiRecord => ({
  ...toRabbiSummary(row),
  prominence: row.prominence,
});

export const list = async (query: RabbiListQuery): Promise<RabbiListResult> => {
  const condition = query.q ? ilike(rabbis.name, `%${escapeLikePattern(query.q)}%`) : undefined;

  const [rows, totalRows] = await Promise.all([
    db
      .select()
      .from(rabbis)
      .where(condition)
      .orderBy(desc(rabbis.updatedAt))
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize),
    db.select({ count: sql<number>`count(*)::int` }).from(rabbis).where(condition),
  ]);

  const rabbiIds = rows.map((row) => row.id);
  const countRows = rabbiIds.length
    ? await db
        .select({ rabbiId: lessons.rabbiId, count: sql<number>`count(*)::int` })
        .from(lessons)
        .where(inArray(lessons.rabbiId, rabbiIds))
        .groupBy(lessons.rabbiId)
    : [];
  const lessonCountByRabbiId = new Map(countRows.map((row) => [row.rabbiId, row.count] as const));

  const items = rows.map((row) => ({ ...toRecord(row), lessonCount: lessonCountByRabbiId.get(row.id) ?? 0 }));
  return { items, page: query.page, pageSize: query.pageSize, total: totalRows[0]?.count ?? 0 };
};

export const getById = async (id: string): Promise<RabbiRecord> => {
  const rows = await db.select().from(rabbis).where(eq(rabbis.id, id)).limit(1);
  const row = rows[0];
  if (!row) throw new RabbiNotFoundError(id);
  return toRecord(row);
};

export const create = async (input: CreateRabbiInput): Promise<RabbiRecord> => {
  const [row] = await db
    .insert(rabbis)
    .values({
      id: nanoid(),
      name: input.name,
      honorific: input.honorific ?? 'rav',
      title: input.title,
      bio: input.bio,
      prominence: input.prominence,
    })
    .returning();
  if (!row) throw new Error('insert into rabbis returned no row');
  return toRecord(row);
};

export const update = async (id: string, input: UpdateRabbiInput): Promise<RabbiRecord> => {
  const [row] = await db
    .update(rabbis)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(rabbis.id, id))
    .returning();
  if (!row) throw new RabbiNotFoundError(id);
  return toRecord(row);
};

export const getDeletePreview = async (id: string): Promise<DeleteRabbiPreviewResult> => {
  await getById(id);

  const [lessonCountRows, exceptionCountRows, courseCountRows] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(lessons).where(eq(lessons.rabbiId, id)),
    db
      .select({ count: sql<number>`count(distinct ${lessonExceptions.id})::int` })
      .from(lessonExceptions)
      .leftJoin(lessons, eq(lessonExceptions.lessonId, lessons.id))
      .where(or(eq(lessons.rabbiId, id), eq(lessonExceptions.substituteRabbiId, id))),
    db.select({ count: sql<number>`count(*)::int` }).from(courses).where(eq(courses.rabbiId, id)),
  ]);

  return {
    lessonCount: lessonCountRows[0]?.count ?? 0,
    exceptionCount: exceptionCountRows[0]?.count ?? 0,
    courseCount: courseCountRows[0]?.count ?? 0,
  };
};

// Deleting a rabbi destroys that rabbi's lessons, those lessons' exceptions,
// any other lesson's exception that named this rabbi as a substitute, and
// his courses and their gallery photo rows, all in one transaction. The
// human explicitly chose cascading delete over blocking it; `confirm` on
// the route is the only thing standing in front of this data loss.
export const remove = async (id: string, confirm: boolean, log: FastifyBaseLogger): Promise<void> => {
  const preview = await getDeletePreview(id);
  if (!confirm) {
    throw new RabbiDeleteConfirmationRequiredError(preview.lessonCount, preview.exceptionCount, preview.courseCount);
  }

  const rabbi = await getById(id);

  const courseObjectKeys = await db.transaction(async (tx) => {
    const ownLessons = await tx.select({ id: lessons.id }).from(lessons).where(eq(lessons.rabbiId, id));
    const ownLessonIds = ownLessons.map((row) => row.id);

    if (ownLessonIds.length) {
      await tx.delete(lessonExceptions).where(inArray(lessonExceptions.lessonId, ownLessonIds));
    }
    await tx.delete(lessonExceptions).where(eq(lessonExceptions.substituteRabbiId, id));
    if (ownLessonIds.length) {
      await tx.delete(lessons).where(inArray(lessons.id, ownLessonIds));
    }

    const ownCourses = await tx.select({ id: courses.id, coverKey: courses.coverKey }).from(courses).where(eq(courses.rabbiId, id));
    const ownCourseIds = ownCourses.map((row) => row.id);
    const ownCoursePhotos = ownCourseIds.length
      ? await tx.select({ storageKey: coursePhotos.storageKey }).from(coursePhotos).where(inArray(coursePhotos.courseId, ownCourseIds))
      : [];
    if (ownCourseIds.length) {
      await tx.delete(coursePhotos).where(inArray(coursePhotos.courseId, ownCourseIds));
      await tx.delete(courses).where(inArray(courses.id, ownCourseIds));
    }

    await tx.delete(rabbis).where(eq(rabbis.id, id));

    return [...ownCourses.map((row) => row.coverKey), ...ownCoursePhotos.map((row) => row.storageKey)];
  });

  await Promise.all(
    courseObjectKeys.map(async (key) => {
      try {
        await storage.remove(key);
      } catch (error) {
        log.error({ err: error, rabbiId: id, key }, 'failed to delete storage object for a removed course');
      }
    }),
  );

  if (!rabbi.photoUrl) return;
  const key = photoKeyFromUrl(rabbi.photoUrl);
  if (!key) return;

  // The rabbi row is already gone; failing to remove the orphaned object
  // in storage must not fail this request, since there is nothing left
  // to roll back to. Log it and move on.
  try {
    await storage.remove(key);
  } catch (error) {
    log.error({ err: error, rabbiId: id }, 'failed to delete storage object for removed rabbi');
  }
};

const PHOTO_SNIFFERS: { contentType: string; extension: string; matches: (bytes: Buffer) => boolean }[] = [
  { contentType: 'image/jpeg', extension: 'jpg', matches: (b) => b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    contentType: 'image/png',
    extension: 'png',
    matches: (b) =>
      b.length >= 8 &&
      b[0] === 0x89 &&
      b[1] === 0x50 &&
      b[2] === 0x4e &&
      b[3] === 0x47 &&
      b[4] === 0x0d &&
      b[5] === 0x0a &&
      b[6] === 0x1a &&
      b[7] === 0x0a,
  },
  {
    contentType: 'image/webp',
    extension: 'webp',
    matches: (b) =>
      b.length >= 12 &&
      b.subarray(0, 4).toString('ascii') === 'RIFF' &&
      b.subarray(8, 12).toString('ascii') === 'WEBP',
  },
];

const sniffPhotoType = (bytes: Buffer): { contentType: string; extension: string } => {
  const match = PHOTO_SNIFFERS.find((sniffer) => sniffer.matches(bytes));
  if (!match) throw new UnsupportedPhotoTypeError();
  return match;
};

const photoKeyFromUrl = (photoUrl: string): string | undefined => {
  const { storagePublicBaseUrl } = loadConfig(process.env);
  const prefix = `${storagePublicBaseUrl}/`;
  return photoUrl.startsWith(prefix) ? photoUrl.slice(prefix.length) : undefined;
};

export const replacePhoto = async (id: string, bytes: Buffer, log: FastifyBaseLogger): Promise<RabbiRecord> => {
  const { maxUploadBytes } = loadConfig(process.env);
  if (bytes.byteLength > maxUploadBytes) throw new PhotoTooLargeError(maxUploadBytes);

  const existing = await getById(id);
  const { contentType, extension } = sniffPhotoType(bytes);

  const key = `rabbis/${id}/${nanoid()}.${extension}`;
  const url = await storage.put(key, bytes, contentType);

  const [row] = await db.update(rabbis).set({ photoUrl: url, updatedAt: new Date() }).where(eq(rabbis.id, id)).returning();
  if (!row) throw new RabbiNotFoundError(id);

  const previousKey = existing.photoUrl ? photoKeyFromUrl(existing.photoUrl) : undefined;
  if (previousKey) {
    // The new photo is already live; failing to clean up the previous
    // object must not fail this request. Log it and continue.
    try {
      await storage.remove(previousKey);
    } catch (error) {
      log.error({ err: error, rabbiId: id }, 'failed to delete previous rabbi photo');
    }
  }

  return toRecord(row);
};
