import { and, eq, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import postgres from 'postgres';

import { db } from '../../db/client';
import { adminUsers } from '../../db/schema';
import { MIN_PASSWORD_LENGTH } from '../admin-auth/consts';
import { hashPassword } from '../admin-auth/password';
import {
  AdminUserNotFoundError,
  AdminUserStillActiveError,
  CannotDeactivateSelfError,
  CannotModifySuperAdminError,
  DuplicateEmailError,
  DuplicateUsernameError,
  WeakPasswordError,
} from './errors';
import type { AdminUserListQuery, AdminUserListResult, AdminUserRecord, CreateAdminUserInput } from './models';

const UNIQUE_VIOLATION = '23505';
const EMAIL_UNIQUE_CONSTRAINT = 'admin_users_email_unique';
const USERNAME_UNIQUE_CONSTRAINT = 'admin_users_username_unique';

// drizzle-orm's postgres-js driver wraps the driver error in its own
// `DrizzleQueryError`, with the real `PostgresError` (and its SQLSTATE
// `code`) on `.cause`, not on the thrown error itself.
const asUniqueViolation = (error: unknown): postgres.PostgresError | undefined => {
  const cause = error instanceof Error ? error.cause : undefined;
  return cause instanceof postgres.PostgresError && cause.code === UNIQUE_VIOLATION ? cause : undefined;
};

type AdminUserRow = typeof adminUsers.$inferSelect;

const toRecord = (row: AdminUserRow): AdminUserRecord => ({
  id: row.id,
  name: row.name,
  email: row.email,
  username: row.username ?? undefined,
  isActive: row.isActive,
  isSuper: row.isSuper,
});

export const list = async (query: AdminUserListQuery): Promise<AdminUserListResult> => {
  const condition = eq(adminUsers.role, 'admin');

  const [rows, totalRows] = await Promise.all([
    db
      .select()
      .from(adminUsers)
      .where(condition)
      .orderBy(adminUsers.name)
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize),
    db.select({ count: sql<number>`count(*)::int` }).from(adminUsers).where(condition),
  ]);

  return { items: rows.map(toRecord), page: query.page, pageSize: query.pageSize, total: totalRows[0]?.count ?? 0 };
};

export const create = async (input: CreateAdminUserInput): Promise<AdminUserRecord> => {
  if (input.password.length < MIN_PASSWORD_LENGTH) throw new WeakPasswordError(MIN_PASSWORD_LENGTH);

  const passwordHash = await hashPassword(input.password);

  try {
    const [row] = await db
      .insert(adminUsers)
      .values({
        id: nanoid(),
        email: input.email,
        username: input.username,
        passwordHash,
        name: input.name,
        role: 'admin',
        rabbiId: null,
        isActive: true,
      })
      .returning();
    if (!row) throw new Error('insert into admin_users returned no row');
    return toRecord(row);
  } catch (error) {
    const violation = asUniqueViolation(error);
    if (violation?.constraint_name === EMAIL_UNIQUE_CONSTRAINT) throw new DuplicateEmailError(input.email);
    if (violation?.constraint_name === USERNAME_UNIQUE_CONSTRAINT) throw new DuplicateUsernameError(input.username ?? '');
    throw error;
  }
};

export const setActive = async (id: string, isActive: boolean, requestingAdminId: string): Promise<AdminUserRecord> => {
  if (id === requestingAdminId && !isActive) throw new CannotDeactivateSelfError();

  const rows = await db
    .select()
    .from(adminUsers)
    .where(and(eq(adminUsers.id, id), eq(adminUsers.role, 'admin')))
    .limit(1);
  const existing = rows[0];
  if (!existing) throw new AdminUserNotFoundError(id);
  // Only deactivating the super admin is blocked: reactivating one is the
  // recovery path if it was ever disabled out of band (direct database
  // access), and blocking that too would remove the only way back.
  if (existing.isSuper && !isActive) throw new CannotModifySuperAdminError();

  const [row] = await db
    .update(adminUsers)
    .set({ isActive, updatedAt: new Date() })
    .where(and(eq(adminUsers.id, id), eq(adminUsers.role, 'admin')))
    .returning();
  if (!row) throw new AdminUserNotFoundError(id);

  return toRecord(row);
};

export const remove = async (id: string): Promise<void> => {
  const rows = await db
    .select()
    .from(adminUsers)
    .where(and(eq(adminUsers.id, id), eq(adminUsers.role, 'admin')))
    .limit(1);
  const row = rows[0];
  if (!row) throw new AdminUserNotFoundError(id);
  if (row.isSuper) throw new CannotModifySuperAdminError();
  if (row.isActive) throw new AdminUserStillActiveError(id);

  await db.delete(adminUsers).where(eq(adminUsers.id, id));
};

export const setPassword = async (id: string, newPassword: string): Promise<AdminUserRecord> => {
  if (newPassword.length < MIN_PASSWORD_LENGTH) throw new WeakPasswordError(MIN_PASSWORD_LENGTH);

  const passwordHash = await hashPassword(newPassword);

  const [row] = await db
    .update(adminUsers)
    .set({ passwordHash, updatedAt: new Date() })
    .where(and(eq(adminUsers.id, id), eq(adminUsers.role, 'admin')))
    .returning();
  if (!row) throw new AdminUserNotFoundError(id);

  return toRecord(row);
};
