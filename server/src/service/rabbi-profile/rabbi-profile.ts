import type { FastifyBaseLogger } from 'fastify';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { loadConfig } from '../../config';
import { db } from '../../db/client';
import { rabbis } from '../../db/schema';
import storage from '../../storage/storage';
import { PhotoTooLargeError, RabbiNotFoundError, UnsupportedPhotoTypeError } from './errors';
import type { RabbiProfileRecord, UpdateRabbiProfileInput } from './models';

type RabbiRow = typeof rabbis.$inferSelect;

// Never includes `prominence`: this is the rabbi's own view of himself,
// and that field must not appear on any response he can see.
const toRecord = (row: RabbiRow): RabbiProfileRecord => ({
  id: row.id,
  name: row.name,
  title: row.title ?? undefined,
  photoUrl: row.photoUrl ?? undefined,
  bio: row.bio ?? undefined,
});

export const getOwn = async (rabbiId: string): Promise<RabbiProfileRecord> => {
  const rows = await db.select().from(rabbis).where(eq(rabbis.id, rabbiId)).limit(1);
  const row = rows[0];
  if (!row) throw new RabbiNotFoundError(rabbiId);
  return toRecord(row);
};

export const updateOwn = async (rabbiId: string, input: UpdateRabbiProfileInput): Promise<RabbiProfileRecord> => {
  const [row] = await db
    .update(rabbis)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(rabbis.id, rabbiId))
    .returning();
  if (!row) throw new RabbiNotFoundError(rabbiId);
  return toRecord(row);
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

export const replaceOwnPhoto = async (rabbiId: string, bytes: Buffer, log: FastifyBaseLogger): Promise<RabbiProfileRecord> => {
  const { maxUploadBytes } = loadConfig(process.env);
  if (bytes.byteLength > maxUploadBytes) throw new PhotoTooLargeError(maxUploadBytes);

  const existing = await getOwn(rabbiId);
  const { contentType, extension } = sniffPhotoType(bytes);

  const key = `rabbis/${rabbiId}/${nanoid()}.${extension}`;
  const url = await storage.put(key, bytes, contentType);

  const [row] = await db.update(rabbis).set({ photoUrl: url, updatedAt: new Date() }).where(eq(rabbis.id, rabbiId)).returning();
  if (!row) throw new RabbiNotFoundError(rabbiId);

  const previousKey = existing.photoUrl ? photoKeyFromUrl(existing.photoUrl) : undefined;
  if (previousKey) {
    // The new photo is already live; failing to clean up the previous
    // object must not fail this request. Log it and continue.
    try {
      await storage.remove(previousKey);
    } catch (error) {
      log.error({ err: error, rabbiId }, 'failed to delete previous rabbi photo');
    }
  }

  return toRecord(row);
};
