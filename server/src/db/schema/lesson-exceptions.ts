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
    // A 'modified' exception may override the lesson's venue for that one
    // date. `placeName`, `placeStreet` and `cityCode` are set together or
    // not at all; `placeFloor` is optional but can only be set alongside
    // them, never on its own. Enforced by `lesson_exceptions_shape` below.
    placeName: text('place_name'),
    placeStreet: text('place_street'),
    placeFloor: text('place_floor'),
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
      sql`(${table.kind} = 'cancelled' AND ${table.startTime} IS NULL AND ${table.placeName} IS NULL AND ${table.placeStreet} IS NULL AND ${table.placeFloor} IS NULL AND ${table.cityCode} IS NULL AND ${table.substituteRabbiId} IS NULL)
       OR (${table.kind} = 'modified' AND ${table.reason} IS NULL AND (${table.placeName} IS NULL) = (${table.placeStreet} IS NULL) AND (${table.placeName} IS NULL) = (${table.cityCode} IS NULL) AND (${table.placeFloor} IS NULL OR ${table.placeName} IS NOT NULL))`,
    ),
  ],
);
