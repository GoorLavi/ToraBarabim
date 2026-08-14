import type { FastifyBaseLogger } from 'fastify';
import { desc, eq, ilike, inArray, or, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { loadConfig } from '../../config';
import { db } from '../../db/client';
import { lessonExceptions, lessons, rabbis } from '../../db/schema';
import storage from '../../storage/storage';
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
  id: row.id,
  name: row.name,
  title: row.title ?? undefined,
  photoUrl: row.photoUrl ?? undefined,
  bio: row.bio ?? undefined,
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

  return { items: rows.map(toRecord), page: query.page, pageSize: query.pageSize, total: totalRows[0]?.count ?? 0 };
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
    .values({ id: nanoid(), name: input.name, title: input.title, bio: input.bio })
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

  const [lessonCountRows, exceptionCountRows] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(lessons).where(eq(lessons.rabbiId, id)),
    db
      .select({ count: sql<number>`count(distinct ${lessonExceptions.id})::int` })
      .from(lessonExceptions)
      .leftJoin(lessons, eq(lessonExceptions.lessonId, lessons.id))
      .where(or(eq(lessons.rabbiId, id), eq(lessonExceptions.substituteRabbiId, id))),
  ]);

  return {
    lessonCount: lessonCountRows[0]?.count ?? 0,
    exceptionCount: exceptionCountRows[0]?.count ?? 0,
  };
};

// Deleting a rabbi destroys that rabbi's lessons, those lessons' exceptions,
// and any other lesson's exception that named this rabbi as a substitute,
// all in one transaction. The human explicitly chose cascading delete over
// blocking it; `confirm` on the route is the only thing standing in front
// of this data loss.
export const remove = async (id: string, confirm: boolean, log: FastifyBaseLogger): Promise<void> => {
  const preview = await getDeletePreview(id);
  if (!confirm) {
    throw new RabbiDeleteConfirmationRequiredError(preview.lessonCount, preview.exceptionCount);
  }

  const rabbi = await getById(id);

  await db.transaction(async (tx) => {
    const ownLessons = await tx.select({ id: lessons.id }).from(lessons).where(eq(lessons.rabbiId, id));
    const ownLessonIds = ownLessons.map((row) => row.id);

    if (ownLessonIds.length) {
      await tx.delete(lessonExceptions).where(inArray(lessonExceptions.lessonId, ownLessonIds));
    }
    await tx.delete(lessonExceptions).where(eq(lessonExceptions.substituteRabbiId, id));
    if (ownLessonIds.length) {
      await tx.delete(lessons).where(inArray(lessons.id, ownLessonIds));
    }
    await tx.delete(rabbis).where(eq(rabbis.id, id));
  });

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
