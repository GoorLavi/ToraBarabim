import { sql } from 'drizzle-orm';
import { check, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { visitorMessageTypeEnum } from './enums';

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
  },
  (table) => [
    check('visitor_messages_phone_local_mobile', sql`${table.phone} ~ '^05[0-9]{8}$'`),
    check('visitor_messages_name_not_blank', sql`char_length(btrim(${table.name})) > 0`),
    check('visitor_messages_message_not_blank', sql`char_length(btrim(${table.message})) > 0`),
    check('visitor_messages_handling_note_not_blank', sql`${table.handlingNote} IS NULL OR char_length(btrim(${table.handlingNote})) > 0`),
  ],
);
