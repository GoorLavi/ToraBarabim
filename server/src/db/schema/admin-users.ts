import { sql } from 'drizzle-orm';
import { boolean, check, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core';

import { adminRoleEnum } from './enums';
import { rabbis } from './rabbis';

export const adminUsers = pgTable(
  'admin_users',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    name: text('name').notNull(),
    role: adminRoleEnum('role').notNull().default('admin'),
    // Set only for a 'rabbi' account, linking it to the one rabbi it
    // manages. A unique constraint on a nullable column only enforces
    // uniqueness among the non-null values in Postgres, which is exactly
    // "at most one account per rabbi", not "at most one null".
    rabbiId: text('rabbi_id').references(() => rabbis.id, { onDelete: 'cascade' }),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique('admin_users_rabbi_id_unique').on(table.rabbiId),
    check(
      'admin_users_role_rabbi_id_shape',
      sql`(${table.role} = 'rabbi' AND ${table.rabbiId} IS NOT NULL) OR (${table.role} = 'admin' AND ${table.rabbiId} IS NULL)`,
    ),
  ],
);
