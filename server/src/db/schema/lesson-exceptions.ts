import { sql } from 'drizzle-orm';
import { check, date, pgTable, serial, text, timestamp, unique } from 'drizzle-orm/pg-core';

import { exceptionKindEnum } from './enums';
import { lessons } from './lessons';
import { places } from './places';
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
    placeId: text('place_id').references(() => places.id),
    substituteRabbiId: text('substitute_rabbi_id').references(() => rabbis.id),
    note: text('note'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique('lesson_exceptions_lesson_date').on(table.lessonId, table.date),
    check(
      'lesson_exceptions_shape',
      sql`(${table.kind} = 'cancelled' AND ${table.startTime} IS NULL AND ${table.placeId} IS NULL AND ${table.substituteRabbiId} IS NULL)
       OR (${table.kind} = 'modified' AND ${table.reason} IS NULL)`,
    ),
  ],
);
