import storage from '../../storage/storage';
import { generatePortraitPng } from './generate-portrait';

// Rabbis that deliberately stay without a photo: the missing-photo card is a
// ratified fallback state (design-system.md, "The poster image"), and real
// data will contain it, so the seed keeps at least two rabbis in it.
export const RABBI_IDS_WITHOUT_PHOTO: ReadonlySet<string> = new Set(['rabbi-4', 'rabbi-7']);

// Uploads a deterministic placeholder portrait for every seeded rabbi id
// except the ones deliberately left without a photo, through the same
// storage path the admin photo upload uses. Runs before the seed
// transaction: it is network I/O against object storage, not a database
// write, and does not belong inside `db.transaction`.
export const uploadSeedPortraits = async (rabbiIds: readonly string[]): Promise<Map<string, string>> => {
  const idsWithPhoto = rabbiIds.filter((id) => !RABBI_IDS_WITHOUT_PHOTO.has(id));

  const uploads = await Promise.all(
    idsWithPhoto.map(async (id) => {
      const bytes = generatePortraitPng(id);
      const key = `rabbis/${id}/seed-portrait.png`;
      const url = await storage.put(key, bytes, 'image/png');
      return [id, url] as const;
    }),
  );

  return new Map(uploads);
};
