import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import postgres from 'postgres';

import { db } from '../../db/client';
import { adminUsers, rabbis } from '../../db/schema';
import { generateTemporaryPassword, hashPassword } from '../admin-auth/password';
import { DuplicateEmailError, DuplicateUsernameError, RabbiAccountAlreadyExistsError, RabbiAccountNotFoundError, RabbiNotFoundError } from './errors';
import type { CreatedRabbiAccountRecord, CreateRabbiAccountInput, RabbiAccountRecord } from './models';

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

type AccountRow = typeof adminUsers.$inferSelect;

const toRecord = (row: AccountRow): RabbiAccountRecord => {
  // Guaranteed by the `admin_users_role_rabbi_id_shape` CHECK constraint:
  // a 'rabbi' row always carries a `rabbiId`. TS cannot see a DB constraint.
  if (!row.rabbiId) throw new Error(`data inconsistency: rabbi account '${row.id}' has role 'rabbi' but no rabbiId`);
  return { id: row.id, email: row.email, username: row.username ?? undefined, rabbiId: row.rabbiId, isActive: row.isActive };
};

const assertRabbiExists = async (rabbiId: string): Promise<void> => {
  const rows = await db.select({ id: rabbis.id }).from(rabbis).where(eq(rabbis.id, rabbiId)).limit(1);
  if (!rows[0]) throw new RabbiNotFoundError(rabbiId);
};

export const getByRabbiId = async (rabbiId: string): Promise<RabbiAccountRecord> => {
  await assertRabbiExists(rabbiId);
  const rows = await db.select().from(adminUsers).where(eq(adminUsers.rabbiId, rabbiId)).limit(1);
  const row = rows[0];
  if (!row) throw new RabbiAccountNotFoundError(rabbiId);
  return toRecord(row);
};

export const create = async (rabbiId: string, input: CreateRabbiAccountInput): Promise<CreatedRabbiAccountRecord> => {
  const rabbiRows = await db.select({ id: rabbis.id, name: rabbis.name }).from(rabbis).where(eq(rabbis.id, rabbiId)).limit(1);
  const rabbi = rabbiRows[0];
  if (!rabbi) throw new RabbiNotFoundError(rabbiId);

  const existing = await db.select({ id: adminUsers.id }).from(adminUsers).where(eq(adminUsers.rabbiId, rabbiId)).limit(1);
  if (existing[0]) throw new RabbiAccountAlreadyExistsError(rabbiId);

  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);

  try {
    const [row] = await db
      .insert(adminUsers)
      .values({
        id: nanoid(),
        email: input.email,
        username: input.username,
        passwordHash,
        name: rabbi.name,
        role: 'rabbi',
        rabbiId,
        isActive: true,
      })
      .returning();
    if (!row) throw new Error('insert into admin_users returned no row');
    return { ...toRecord(row), temporaryPassword };
  } catch (error) {
    const violation = asUniqueViolation(error);
    if (violation?.constraint_name === EMAIL_UNIQUE_CONSTRAINT) throw new DuplicateEmailError(input.email);
    if (violation?.constraint_name === USERNAME_UNIQUE_CONSTRAINT) throw new DuplicateUsernameError(input.username ?? '');
    throw error;
  }
};

export const resetPassword = async (rabbiId: string): Promise<string> => {
  await assertRabbiExists(rabbiId);

  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);

  const [row] = await db
    .update(adminUsers)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(adminUsers.rabbiId, rabbiId))
    .returning({ id: adminUsers.id });
  if (!row) throw new RabbiAccountNotFoundError(rabbiId);

  return temporaryPassword;
};

export const setActive = async (rabbiId: string, isActive: boolean): Promise<RabbiAccountRecord> => {
  await assertRabbiExists(rabbiId);

  const [row] = await db
    .update(adminUsers)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(adminUsers.rabbiId, rabbiId))
    .returning();
  if (!row) throw new RabbiAccountNotFoundError(rabbiId);

  return toRecord(row);
};
