import { sql } from 'drizzle-orm';
import { boolean, check, date, integer, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core';

import { cities } from './cities';
import { CLOSE_REASONS, lessonAudienceEnum, lessonTopicEnum } from './enums';
import { places } from './places';
import { rabbis } from './rabbis';

// Built from `CLOSE_REASONS`, not hand-typed: `sql.raw` is safe here since
// the list is a fixed internal constant, never user input.
const closeReasonList = sql.join(
  CLOSE_REASONS.map((reason) => sql.raw(`'${reason}'`)),
  sql.raw(', '),
);

export const courses = pgTable(
  'courses',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    // Shown as "מחזור 3" beside the name; never part of the slug (derived at
    // read time, like a rabbi's, so a duplicate's own cycle never touches
    // it).
    cycle: integer('cycle'),
    description: text('description').notNull(),
    // A course's teacher is a linked rabbi or a free-text name, never both,
    // never neither. Enforced by `courses_teacher_shape` below.
    rabbiId: text('rabbi_id').references(() => rabbis.id),
    teacherName: text('teacher_name'),
    openingDate: date('opening_date', { mode: 'string' }).notNull(),
    weeks: integer('weeks').notNull(),
    sessions: integer('sessions').notNull(),
    hours: integer('hours'),
    // A course's venue is a lesson's shape (place or address, never both,
    // never neither), enforced by `courses_venue_shape` below. Unlike a
    // lesson, a place-backed course's city is read through the join and
    // never denormalized here: nothing on the course side needs the
    // duplicate a lesson keeps for its search's hot path. Enforced by
    // `courses_venue_no_city_code_on_place`, so `cityCode` is set on the
    // address arm only.
    placeId: text('place_id').references(() => places.id),
    addressName: text('address_name'),
    addressStreet: text('address_street'),
    addressFloor: text('address_floor'),
    cityCode: integer('city_code').references(() => cities.code),
    audience: lessonAudienceEnum('audience').notNull(),
    // `topicOther` is set only alongside `topic = 'other'`, enforced by
    // `courses_topic_shape` below.
    topic: lessonTopicEnum('topic'),
    topicOther: text('topic_other'),
    joinableAfterOpening: boolean('joinable_after_opening').notNull().default(false),
    contactPhone: text('contact_phone').notNull(),
    priceShekels: integer('price_shekels'),
    // Required, unlike a gallery photo: every course has exactly one cover,
    // set at creation through the multipart create, replaceable but never
    // removable.
    coverKey: text('cover_key').notNull(),
    // Set only by the close and full routes, only while NULL, and never
    // cleared: closing (by either reason) is final. `closeReason` is plain
    // text, not a Postgres enum: this slice adds no new enum type, and the
    // two values ('closed', 'full') are enforced by `courses_close_shape`
    // below.
    registrationClosedAt: timestamp('registration_closed_at', { withTimezone: true }),
    closeReason: text('close_reason'),
    // No writer today: every public read filters on this in one base
    // predicate, so a future payment gate adds a writer, not a migration.
    published: boolean('published').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check(
      'courses_teacher_shape',
      sql`(${table.rabbiId} IS NOT NULL AND ${table.teacherName} IS NULL) OR (${table.rabbiId} IS NULL AND ${table.teacherName} IS NOT NULL)`,
    ),
    check(
      'courses_venue_shape',
      sql`(${table.placeId} IS NOT NULL AND ${table.addressName} IS NULL AND ${table.addressStreet} IS NULL AND ${table.addressFloor} IS NULL)
       OR (${table.placeId} IS NULL AND ${table.addressName} IS NOT NULL AND ${table.addressStreet} IS NOT NULL)`,
    ),
    check(
      'courses_venue_no_city_code_on_place',
      sql`(${table.placeId} IS NOT NULL AND ${table.cityCode} IS NULL) OR (${table.placeId} IS NULL AND ${table.cityCode} IS NOT NULL)`,
    ),
    // The third branch guards with its own `topic IS NOT NULL` rather than
    // relying on `topic = 'other'` alone: SQL's three-valued logic makes
    // `NULL = 'other'` evaluate to NULL, not FALSE, and a CHECK whose whole
    // expression evaluates to NULL is treated as satisfied, not violated,
    // so `topic IS NULL AND topicOther IS NOT NULL` would otherwise slip
    // through uncaught.
    check(
      'courses_topic_shape',
      sql`(${table.topic} IS NULL AND ${table.topicOther} IS NULL)
       OR (${table.topic} IS NOT NULL AND ${table.topic} <> 'other' AND ${table.topicOther} IS NULL)
       OR (${table.topic} IS NOT NULL AND ${table.topic} = 'other' AND ${table.topicOther} IS NOT NULL)`,
    ),
    // `closeReason` is set exactly when `registrationClosedAt` is, and only
    // to one of `CLOSE_REASONS`: a CHECK cannot reference a Postgres enum
    // this slice deliberately did not add, so the list is built from that
    // tuple instead of naming the two values here by hand. The second
    // branch guards with its own `closeReason IS NOT NULL` for the same
    // reason `courses_topic_shape` above does: `NULL IN (...)` is NULL, not
    // FALSE, so `registrationClosedAt IS NOT NULL AND closeReason IS NULL`
    // would otherwise pass a CHECK whose result is NULL rather than FALSE.
    check(
      'courses_close_shape',
      sql`(${table.registrationClosedAt} IS NULL AND ${table.closeReason} IS NULL)
       OR (${table.registrationClosedAt} IS NOT NULL AND ${table.closeReason} IS NOT NULL AND ${table.closeReason} IN (${closeReasonList}))`,
    ),
  ],
);

// A course's gallery, up to 8 rows (enforced in the service, not here: a
// CHECK cannot count sibling rows). The cover lives on `courses.cover_key`
// directly, never as a row here. Deleting a course's photo rows is always
// done explicitly by the service, in the same transaction as the course row
// itself (both a direct delete and the rabbi cascade), so this FK carries
// no `onDelete` of its own, matching `lesson_exceptions.lesson_id`.
export const coursePhotos = pgTable(
  'course_photos',
  {
    id: text('id').primaryKey(),
    courseId: text('course_id')
      .notNull()
      .references(() => courses.id),
    storageKey: text('storage_key').notNull(),
    // Upload order, assigned `max + 1` under the course row's lock; the
    // cover is never a row here, so position 0 is always the first gallery
    // photo, not the cover.
    position: integer('position').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique('course_photos_course_id_position_unique').on(table.courseId, table.position)],
);
