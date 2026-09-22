import { sql } from 'drizzle-orm';
import { check, date, integer, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

import { cities } from './cities';
import { lessonAudienceEnum, lessonProvenanceEnum, lessonTopicEnum, recurrenceKindEnum } from './enums';
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
    // A lesson's venue is either a registered place, or its own free text:
    // never both, never neither. Enforced by `lessons_venue_shape` below.
    // `addressName`/`addressStreet`/`addressFloor` were `NOT NULL` before a
    // place could be referenced; every existing row is address-only, so
    // relaxing them here validates clean. The properties are `address*`;
    // the free-text columns stay `place_*` because renaming a column is a
    // migration, and this rename has none.
    placeId: text('place_id').references(() => places.id),
    addressName: text('place_name'),
    addressStreet: text('place_street'),
    addressFloor: text('place_floor'),
    // Denormalized here even for a place-backed lesson (0016's reversal
    // keeps it, deliberately): it is the only SQL narrowing on the public
    // search's hot path, and a join would make every one of that search's
    // city/area filters non-sargable. `service/shared/lesson-write.ts`'s
    // `lessonVenueColumns` is the one function that may set it; see the
    // comment there for what it costs.
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
      'lessons_venue_shape',
      sql`(${table.placeId} IS NOT NULL AND ${table.addressName} IS NULL AND ${table.addressStreet} IS NULL AND ${table.addressFloor} IS NULL)
       OR (${table.placeId} IS NULL AND ${table.addressName} IS NOT NULL AND ${table.addressStreet} IS NOT NULL)`,
    ),
    check(
      'lessons_provenance_shape',
      sql`(${table.provenance} = 'manual' AND ${table.importKey} IS NULL AND ${table.importSources} IS NULL)
       OR (${table.provenance} IN ('imported', 'imported_edited') AND ${table.importKey} IS NOT NULL)`,
    ),
    uniqueIndex('lessons_import_key_unique').on(table.importKey).where(sql`${table.importKey} IS NOT NULL`),
  ],
);
