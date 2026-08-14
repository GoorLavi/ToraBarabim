import { sql } from 'drizzle-orm';
import { check, date, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { lessonAudienceEnum, lessonTopicEnum, recurrenceKindEnum } from './enums';
import { places } from './places';
import { rabbis } from './rabbis';

export const lessons = pgTable(
  'lessons',
  {
    id: text('id').primaryKey(),
    title: text('title'),
    rabbiId: text('rabbi_id')
      .notNull()
      .references(() => rabbis.id),
    placeId: text('place_id')
      .notNull()
      .references(() => places.id),
    topic: lessonTopicEnum('topic'),
    audience: lessonAudienceEnum('audience').notNull(),
    recurrenceKind: recurrenceKindEnum('recurrence_kind').notNull(),
    recurrenceWeekdays: integer('recurrence_weekdays').array(),
    recurrenceDate: date('recurrence_date', { mode: 'string' }),
    startTime: text('start_time').notNull(),
    durationMinutes: integer('duration_minutes').notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check(
      'lessons_recurrence_shape',
      sql`(${table.recurrenceKind} = 'weekly' AND ${table.recurrenceWeekdays} IS NOT NULL AND ${table.recurrenceDate} IS NULL)
       OR (${table.recurrenceKind} = 'once' AND ${table.recurrenceDate} IS NOT NULL AND ${table.recurrenceWeekdays} IS NULL)`,
    ),
  ],
);
