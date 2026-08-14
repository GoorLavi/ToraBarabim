import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { cities } from './cities';

export const places = pgTable('places', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  cityId: integer('city_id')
    .notNull()
    .references(() => cities.code),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
