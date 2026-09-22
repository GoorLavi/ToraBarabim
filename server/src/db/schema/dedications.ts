import { sql } from 'drizzle-orm';
import { boolean, check, date, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { dedicationHonorificEnum, dedicationTypeEnum, honoredGenderEnum } from './enums';

export const dedications = pgTable(
  'dedications',
  {
    id: text('id').primaryKey(),
    type: dedicationTypeEnum('type').notNull(),
    // Clean stored fields only, no free text: trimmed, no NBSP, no composed
    // string. The composed display text (`service/dedication/text.ts`) is
    // built from these at read time and never stored.
    honoredName: text('honored_name').notNull(),
    honorific: dedicationHonorificEnum('honorific'),
    honoredGender: honoredGenderEnum('honored_gender').notNull(),
    parentName: text('parent_name'),
    donorFamilyName: text('donor_family_name'),
    closingLineEnabled: boolean('closing_line_enabled').notNull().default(false),
    startsOn: date('starts_on', { mode: 'string' }).notNull(),
    endsOn: date('ends_on', { mode: 'string' }).notNull(),
    // Set together or not at all (enforced below): a taken-down dedication
    // always carries the reason it was pulled.
    takenDownAt: timestamp('taken_down_at', { withTimezone: true }),
    takenDownReason: text('taken_down_reason'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check('dedications_window', sql`${table.endsOn} >= ${table.startsOn}`),
    check('dedications_takedown_reason', sql`(${table.takenDownAt} IS NULL) = (${table.takenDownReason} IS NULL)`),
  ],
);
