import { todayInIsrael } from '../service/lesson/israel-time';
import { db } from './client';
import { seedCities } from './seed/cities';
import { seedDedications } from './seed/dedications';
import { seedLessons, SEED_RABBI_IDS } from './seed/lessons';
import { uploadSeedPortraits } from './seed/rabbi-photos';

// `--skip-portraits` (see `db:seed:no-photos`) is for environments with no
// object storage, such as CI: every rabbi is seeded without a photoUrl. The
// product says every rabbi has a portrait (docs/product.md), so this is a
// deliberate trade for a hermetic CI, not a state the product endorses; the
// public-api suite never asserts on an image, so it never notices.
const skipPortraits = process.argv.includes('--skip-portraits');

const run = async (): Promise<void> => {
  const todayIso = todayInIsrael(new Date());

  if (skipPortraits) {
    console.log('--skip-portraits: no object storage required, seeded rabbis will use the missing-photo fallback.');
  }

  // Uploads are network calls against object storage, not database writes,
  // so they run before the transaction rather than inside it.
  const photoUrlByRabbiId = skipPortraits ? new Map<string, string>() : await uploadSeedPortraits(SEED_RABBI_IDS);

  await db.transaction(async (tx) => {
    const cityCodeByName = await seedCities(tx);
    await seedLessons(tx, cityCodeByName, todayIso, photoUrlByRabbiId);
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
