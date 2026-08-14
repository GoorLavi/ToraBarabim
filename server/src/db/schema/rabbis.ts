import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const rabbis = pgTable('rabbis', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  title: text('title'),
  photoUrl: text('photo_url'),
  bio: text('bio'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
