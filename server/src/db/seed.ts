import { todayInIsrael } from '../service/lesson/israel-time';
import { db } from './client';
import { seedCities } from './seed/cities';
import { seedCourses, SEED_COURSE_IDS, uploadSeedCourseCovers } from './seed/courses';
import { seedDedications } from './seed/dedications';
import { seedLessons, SEED_RABBI_IDS } from './seed/lessons';
import { uploadSeedPortraits } from './seed/rabbi-photos';

// `--skip-portraits` (see `db:seed:no-photos`) is for environments with no
// object storage, such as CI: every rabbi is seeded without a photoUrl, and
// courses are skipped entirely, since a course's cover is required (never
// optional the way a rabbi's portrait is) and has nowhere to upload to. The
// product says every rabbi has a portrait and every course has a cover
// (docs/product.md), so this is a deliberate trade for a hermetic CI, not a
// state the product endorses; the public-api suite never asserts on an
// image or a course, so it never notices.
const skipPortraits = process.argv.includes('--skip-portraits');

const run = async (): Promise<void> => {
  const todayIso = todayInIsrael(new Date());

  if (skipPortraits) {
    console.log('--skip-portraits: no object storage required, seeded rabbis will use the missing-photo fallback and courses are skipped.');
  }

  // Uploads are network calls against object storage, not database writes,
  // so they run before the transaction rather than inside it.
  const [photoUrlByRabbiId, coverKeyByCourseId] = await Promise.all([
    skipPortraits ? Promise.resolve(new Map<string, string>()) : uploadSeedPortraits(SEED_RABBI_IDS),
    skipPortraits ? Promise.resolve(new Map<string, string>()) : uploadSeedCourseCovers(SEED_COURSE_IDS),
  ]);

  await db.transaction(async (tx) => {
    const cityCodeByName = await seedCities(tx);
    await seedLessons(tx, cityCodeByName, todayIso, photoUrlByRabbiId);
    if (!skipPortraits) await seedCourses(tx, cityCodeByName, todayIso, coverKeyByCourseId);
    await seedDedications(tx, todayIso);
  });
};

run()
  .then(() => {
    console.log('Seed complete.');
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
