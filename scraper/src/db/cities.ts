import { drizzle } from 'drizzle-orm/postgres-js';
import { pgTable, integer, text, pgEnum } from 'drizzle-orm/pg-core';
import postgres from 'postgres';
import type { Area, City } from '@torabarabim/common';

import { loadConfig } from '../config';

// Mirrors the columns of server/src/db/schema/cities.ts. The scraper only
// ever reads this table, so it declares its own minimal view of it rather
// than importing server's private src. Keep the column list and the area
// tuple in sync by hand if the server schema changes.
const areaEnum = pgEnum('area', [
  'north',
  'haifa',
  'sharon',
  'center',
  'telAviv',
  'jerusalem',
  'shfela',
  'south',
]);

const cities = pgTable('cities', {
  code: integer('code').primaryKey(),
  nameHe: text('name_he').notNull(),
  nameEn: text('name_en'),
  area: areaEnum('area').notNull(),
});

export const fetchCities = async (): Promise<City[]> => {
  const { databaseUrl } = loadConfig(process.env);
  const sql = postgres(databaseUrl);
  try {
    const db = drizzle(sql);
    const rows = await db.select({ code: cities.code, nameHe: cities.nameHe, area: cities.area }).from(cities);
    return rows.map((row) => ({ id: String(row.code), name: row.nameHe, area: row.area as Area }));
  } finally {
    await sql.end();
  }
};
