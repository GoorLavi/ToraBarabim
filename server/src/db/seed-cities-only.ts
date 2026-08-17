// Cities only, nothing else. Safe to run against production: seedCities
// upserts on the official locality code, and this entry point never touches
// rabbis, places, lessons, exceptions, or admin users. The full `db:seed`
// script also seeds invented sample lessons and must never run against a
// live database; see docs/decisions/0001-lessons-are-admin-entered.md.
import { db } from './client';
import { seedCities } from './seed/cities';

const run = async (): Promise<void> => {
  const cityCodeByName = await db.transaction(async (tx) => seedCities(tx));
  console.log(`Seeded ${cityCodeByName.size} localities.`);
};

run()
  .then(() => {
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error('City seed failed, nothing was written:', error);
    process.exit(1);
  });
