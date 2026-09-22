import { sql } from 'drizzle-orm';
import { check, date, integer, pgTable, serial, text, timestamp, unique } from 'drizzle-orm/pg-core';

import { cities } from './cities';
import { exceptionKindEnum } from './enums';
import { lessons } from './lessons';
import { rabbis } from './rabbis';

export const lessonExceptions = pgTable(
  'lesson_exceptions',
  {
    id: serial('id').primaryKey(),
    lessonId: text('lesson_id')
      .notNull()
      .references(() => lessons.id),
    date: date('date', { mode: 'string' }).notNull(),
    kind: exceptionKindEnum('kind').notNull(),
    reason: text('reason'),
    startTime: text('start_time'),
    // A 'modified' exception may override the lesson's address for that one
    // date. `addressName`, `addressStreet` and `cityCode` are set together
    // or not at all; `addressFloor` is optional but can only be set
    // alongside them, never on its own. Enforced by `lesson_exceptions_shape`
    // below. The properties are `address*`; the columns stay `place_*`
    // because renaming a column is a migration, and this rename has none.
    addressName: text('place_name'),
    addressStreet: text('place_street'),
    addressFloor: text('place_floor'),
    cityCode: integer('city_code').references(() => cities.code),
    substituteRabbiId: text('substitute_rabbi_id').references(() => rabbis.id),
    note: text('note'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique('lesson_exceptions_lesson_date').on(table.lessonId, table.date),
    check(
      'lesson_exceptions_shape',
      sql`(${table.kind} = 'cancelled' AND ${table.startTime} IS NULL AND ${table.addressName} IS NULL AND ${table.addressStreet} IS NULL AND ${table.addressFloor} IS NULL AND ${table.cityCode} IS NULL AND ${table.substituteRabbiId} IS NULL)
       OR (${table.kind} = 'modified' AND ${table.reason} IS NULL AND (${table.addressName} IS NULL) = (${table.addressStreet} IS NULL) AND (${table.addressName} IS NULL) = (${table.cityCode} IS NULL) AND (${table.addressFloor} IS NULL OR ${table.addressName} IS NOT NULL))`,
    ),
  ],
);
