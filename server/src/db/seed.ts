import { todayInIsrael } from '../service/lesson/israel-time';
import { db } from './client';
import { seedCities } from './seed/cities';
import { seedLessons } from './seed/lessons';

const run = async (): Promise<void> => {
  const todayIso = todayInIsrael(new Date());

  await db.transaction(async (tx) => {
    const cityCodeByName = await seedCities(tx);
    await seedLessons(tx, cityCodeByName, todayIso);
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
