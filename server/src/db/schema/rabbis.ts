import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { rabbiHonorificEnum, rabbiProminenceEnum } from './enums';

export const rabbis = pgTable('rabbis', {
  id: text('id').primaryKey(),
  // Bare, never carrying an honorific: the client composes "הרב <name>" or
  // "הרבנית <name>" from this and `honorific`.
  name: text('name').notNull(),
  honorific: rabbiHonorificEnum('honorific').notNull().default('rav'),
  title: text('title'),
  photoUrl: text('photo_url'),
  bio: text('bio'),
  // Sort input for the home-page rails only; never sent on the public API.
  prominence: rabbiProminenceEnum('prominence').notNull().default('local'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
