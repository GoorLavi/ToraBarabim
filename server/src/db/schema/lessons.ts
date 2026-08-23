import { sql } from 'drizzle-orm';
import { check, date, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { cities } from './cities';
import { lessonAudienceEnum, lessonTopicEnum, recurrenceKindEnum } from './enums';
import { rabbis } from './rabbis';

export const lessons = pgTable(
  'lessons',
  {
    id: text('id').primaryKey(),
    title: text('title'),
    rabbiId: text('rabbi_id')
      .notNull()
      .references(() => rabbis.id),
    // The venue is free text on the lesson, not a registered entity: a
    // rabbi must never be blocked from adding a lesson because its venue
    // is not recognised. `cityCode` stays structured, since the home page
    // and the city/area filters depend on it.
    placeName: text('place_name').notNull(),
    placeStreet: text('place_street').notNull(),
    placeFloor: text('place_floor'),
    cityCode: integer('city_code')
      .notNull()
      .references(() => cities.code),
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
