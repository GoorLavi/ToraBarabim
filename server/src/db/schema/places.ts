import { boolean, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { cities } from './cities';

// A registered venue: a synagogue, a beit midrash, a hall, shared by every
// lesson held there. Reversed decision 0016 ("a venue is a field of the
// lesson, not an entity"): a lesson may still carry its own free-text
// address instead of pointing here (`lessons.place_id`), but once several
// lessons share a building, this is where its name and address live once.
export const places = pgTable('places', {
  id: text('id').primaryKey(),
  // Derived server-side from `name`, the same as a rabbi's own slug: not
  // unique, since the id, not the slug, is what resolves a place.
  slug: text('slug').notNull(),
  name: text('name').notNull(),
  street: text('street').notNull(),
  floor: text('floor'),
  cityCode: integer('city_code')
    .notNull()
    .references(() => cities.code),
  photoUrl: text('photo_url'),
  // The whole delete mechanism: there is no delete route for a place, only
  // this flag. A deactivated place drops off `/v1/places`, its own detail
  // route answers 404, and a lesson still pointing at it resolves to its
  // last-known address with no id, never a dead link.
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
