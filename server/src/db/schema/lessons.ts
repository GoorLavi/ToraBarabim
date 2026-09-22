import { sql } from 'drizzle-orm';
import { check, date, integer, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

import { cities } from './cities';
import { lessonAudienceEnum, lessonProvenanceEnum, lessonTopicEnum, recurrenceKindEnum } from './enums';
import { rabbis } from './rabbis';

export const lessons = pgTable(
  'lessons',
  {
    id: text('id').primaryKey(),
    title: text('title'),
    rabbiId: text('rabbi_id')
      .notNull()
      .references(() => rabbis.id),
    // The address is free text on the lesson, not a registered entity: a
    // rabbi must never be blocked from adding a lesson because its address
    // is not recognised. `cityCode` stays structured, since the home page
    // and the city/area filters depend on it.
    // The property is `address*`; the column stays `place_*` because
    // renaming a column is a migration, and this rename has none.
    addressName: text('place_name').notNull(),
    addressStreet: text('place_street').notNull(),
    addressFloor: text('place_floor'),
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
    // 'manual' is the default so every existing (and every hand-entered)
    // lesson is untouched by the weekly import. `importKey` and
    // `importSources` are only ever set on an 'imported' or
    // 'imported_edited' row; see `lessons_provenance_shape` below.
    provenance: lessonProvenanceEnum('provenance').notNull().default('manual'),
    // `${rabbiId}|w${weekday}|${addressKey}` for a weekly row or
    // `${rabbiId}|d${isoDate}|${addressKey}` for a one-off, computed by the
    // import planner. Identifies "the same lesson" across weekly import
    // runs so a run can update in place instead of creating a duplicate.
    importKey: text('import_key'),
    // The source domains (e.g. 'ayal-taarog.org.il') that reported this
    // lesson as of its last import, used to decide whether a lesson is
    // safe to delete when a source stops reporting it.
    importSources: text('import_sources').array(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check(
      'lessons_recurrence_shape',
      sql`(${table.recurrenceKind} = 'weekly' AND ${table.recurrenceWeekdays} IS NOT NULL AND ${table.recurrenceDate} IS NULL)
       OR (${table.recurrenceKind} = 'once' AND ${table.recurrenceDate} IS NOT NULL AND ${table.recurrenceWeekdays} IS NULL)`,
    ),
    check(
      'lessons_provenance_shape',
      sql`(${table.provenance} = 'manual' AND ${table.importKey} IS NULL AND ${table.importSources} IS NULL)
       OR (${table.provenance} IN ('imported', 'imported_edited') AND ${table.importKey} IS NOT NULL)`,
    ),
    uniqueIndex('lessons_import_key_unique').on(table.importKey).where(sql`${table.importKey} IS NOT NULL`),
  ],
);
