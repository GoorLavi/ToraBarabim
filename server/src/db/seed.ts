import { todayInIsrael } from '../service/lesson/israel-time';
import { db } from './client';
import { seedCities } from './seed/cities';
import { seedLessons, SEED_RABBI_IDS } from './seed/lessons';
import { uploadSeedPortraits } from './seed/rabbi-photos';

const run = async (): Promise<void> => {
  const todayIso = todayInIsrael(new Date());

  // Uploads are network calls against object storage, not database writes,
  // so they run before the transaction rather than inside it.
  const photoUrlByRabbiId = await uploadSeedPortraits(SEED_RABBI_IDS);

  await db.transaction(async (tx) => {
    const cityCodeByName = await seedCities(tx);
    await seedLessons(tx, cityCodeByName, todayIso, photoUrlByRabbiId);
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
