import { sql } from 'drizzle-orm';
import { boolean, check, pgTable, text, timestamp, unique, uniqueIndex } from 'drizzle-orm/pg-core';

import { adminRoleEnum } from './enums';
import { rabbis } from './rabbis';

export const adminUsers = pgTable(
  'admin_users',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull().unique(),
    // Optional alternate login handle. Nullable and unique among non-null
    // values, same reasoning as `rabbiId` below: Postgres never conflicts
    // two nulls, so "no username set" is not "username taken".
    username: text('username'),
    passwordHash: text('password_hash').notNull(),
    name: text('name').notNull(),
    role: adminRoleEnum('role').notNull().default('admin'),
    // Set only for a 'rabbi' account, linking it to the one rabbi it
    // manages. A unique constraint on a nullable column only enforces
    // uniqueness among the non-null values in Postgres, which is exactly
    // "at most one account per rabbi", not "at most one null".
    rabbiId: text('rabbi_id').references(() => rabbis.id, { onDelete: 'cascade' }),
    isActive: boolean('is_active').notNull().default(true),
    // At most one row in the entire table can ever have this set: see the
    // partial unique index below. A rabbi account can never be super: see
    // the CHECK constraint below.
    isSuper: boolean('is_super').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique('admin_users_rabbi_id_unique').on(table.rabbiId),
    unique('admin_users_username_unique').on(table.username),
    check(
      'admin_users_role_rabbi_id_shape',
      sql`(${table.role} = 'rabbi' AND ${table.rabbiId} IS NOT NULL) OR (${table.role} = 'admin' AND ${table.rabbiId} IS NULL)`,
    ),
    check('admin_users_super_requires_admin_role', sql`${table.isSuper} = false OR ${table.role} = 'admin'`),
    // Enforces "exactly one super admin, ever" at the database level: a
    // partial unique index only ever has to reject a second row where
    // `is_super` is true, so it never conflicts with the many rows where
    // it is false.
    uniqueIndex('admin_users_single_super_admin').on(table.isSuper).where(sql`${table.isSuper} = true`),
  ],
);
