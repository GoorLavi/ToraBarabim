import { integer, pgTable, text } from 'drizzle-orm/pg-core';

import { areaEnum } from './enums';

// `code` is the official סמל_ישוב from data.gov.il, used as-is rather than
// a surrogate key, so re-importing the source data stays a natural upsert.
export const cities = pgTable('cities', {
  code: integer('code').primaryKey(),
  nameHe: text('name_he').notNull(),
  nameEn: text('name_en'),
  area: areaEnum('area').notNull(),
  // Null where the census dataset has no row for this locality code, not 0.
  population: integer('population'),
});
