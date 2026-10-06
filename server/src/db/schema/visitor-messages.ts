import { sql } from 'drizzle-orm';
import { check, date, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { VISITOR_MESSAGE_SUBJECT_KINDS, visitorMessageTypeEnum } from './enums';

// Built from the tuple, not hand-typed: `sql.raw` is safe here since the list
// is a fixed internal constant, never user input.
const subjectKindList = sql.join(
  VISITOR_MESSAGE_SUBJECT_KINDS.map((kind) => sql.raw(`'${kind}'`)),
  sql.raw(', '),
);

export const visitorMessages = pgTable(
  'visitor_messages',
  {
    id: text('id').primaryKey(),
    type: visitorMessageTypeEnum('type').notNull(),
    name: text('name').notNull(),
    // Stored normalised to the local form 05XXXXXXXX, never +972.
    phone: text('phone').notNull(),
    message: text('message').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    // Null means unhandled.
    handledAt: timestamp('handled_at', { withTimezone: true }),
    // How the super admin handled it. Null, never an empty string.
    handlingNote: text('handling_note'),
    // What a 'report-mistake' is about, kept as plain columns with no foreign
    // key: a lesson is hard-deleted and the report must survive it. Null on
    // every other type.
    subjectKind: text('subject_kind'),
    subjectId: text('subject_id'),
    subjectDate: date('subject_date', { mode: 'string' }),
  },
  (table) => [
    check('visitor_messages_phone_local_mobile', sql`${table.phone} ~ '^05[0-9]{8}$'`),
    check('visitor_messages_name_not_blank', sql`char_length(btrim(${table.name})) > 0`),
    check('visitor_messages_message_not_blank', sql`char_length(btrim(${table.message})) > 0`),
    check('visitor_messages_handling_note_not_blank', sql`${table.handlingNote} IS NULL OR char_length(btrim(${table.handlingNote})) > 0`),
    // Compares `type::text`, never the enum literal: the migration that adds
    // 'report-mistake' to the enum runs in the same transaction as this
    // CHECK, and Postgres refuses to use a new enum value there. Every
    // branch guards with its own IS NOT NULL (or IS NULL) so a NULL
    // comparison can never make a branch pass.
    check(
      'visitor_messages_subject_by_type',
      sql`(${table.type}::text = 'report-mistake' AND ${table.subjectKind} IS NOT NULL AND ${table.subjectId} IS NOT NULL)
       OR (${table.type}::text <> 'report-mistake' AND ${table.subjectKind} IS NULL AND ${table.subjectId} IS NULL AND ${table.subjectDate} IS NULL)`,
    ),
    // A lesson subject names a date, a place subject never does.
    check(
      'visitor_messages_subject_shape',
      sql`(${table.subjectKind} IS NULL AND ${table.subjectId} IS NULL AND ${table.subjectDate} IS NULL)
       OR (${table.subjectKind} IS NOT NULL AND ${table.subjectKind} IN (${subjectKindList}) AND ${table.subjectId} IS NOT NULL
           AND ((${table.subjectKind} = 'lesson' AND ${table.subjectDate} IS NOT NULL) OR (${table.subjectKind} = 'place' AND ${table.subjectDate} IS NULL)))`,
    ),
  ],
);
