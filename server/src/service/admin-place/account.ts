import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import postgres from 'postgres';

import { db } from '../../db/client';
import { adminUsers, places } from '../../db/schema';
import { generateTemporaryPassword, hashPassword } from '../admin-auth/password';
import { DuplicateEmailError, DuplicateUsernameError, PlaceAccountAlreadyExistsError, PlaceAccountNotFoundError, PlaceNotFoundError } from './errors';
import type { CreatedPlaceAccountRecord, CreatePlaceAccountInput, PlaceAccountRecord } from './models';

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

const toRecord = (row: AccountRow): PlaceAccountRecord => {
  // Guaranteed by the `admin_users_role_shape` CHECK constraint: a 'place'
  // row always carries a `placeId`. TS cannot see a DB constraint.
  if (!row.placeId) throw new Error(`data inconsistency: place account '${row.id}' has role 'place' but no placeId`);
  return { id: row.id, email: row.email, username: row.username ?? undefined, placeId: row.placeId, isActive: row.isActive };
};

const assertPlaceExists = async (placeId: string): Promise<void> => {
  const rows = await db.select({ id: places.id }).from(places).where(eq(places.id, placeId)).limit(1);
  if (!rows[0]) throw new PlaceNotFoundError(placeId);
};

export const getByPlaceId = async (placeId: string): Promise<PlaceAccountRecord> => {
  await assertPlaceExists(placeId);
  const rows = await db.select().from(adminUsers).where(eq(adminUsers.placeId, placeId)).limit(1);
  const row = rows[0];
  if (!row) throw new PlaceAccountNotFoundError(placeId);
  return toRecord(row);
};

export const create = async (placeId: string, input: CreatePlaceAccountInput): Promise<CreatedPlaceAccountRecord> => {
  const placeRows = await db.select({ id: places.id, name: places.name }).from(places).where(eq(places.id, placeId)).limit(1);
  const place = placeRows[0];
  if (!place) throw new PlaceNotFoundError(placeId);

  const existing = await db.select({ id: adminUsers.id }).from(adminUsers).where(eq(adminUsers.placeId, placeId)).limit(1);
  if (existing[0]) throw new PlaceAccountAlreadyExistsError(placeId);

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
        name: place.name,
        role: 'place',
        placeId,
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

export const resetPassword = async (placeId: string): Promise<string> => {
  await assertPlaceExists(placeId);

  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);

  const [row] = await db
    .update(adminUsers)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(adminUsers.placeId, placeId))
    .returning({ id: adminUsers.id });
  if (!row) throw new PlaceAccountNotFoundError(placeId);

  return temporaryPassword;
};

export const setActive = async (placeId: string, isActive: boolean): Promise<PlaceAccountRecord> => {
  await assertPlaceExists(placeId);

  const [row] = await db
    .update(adminUsers)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(adminUsers.placeId, placeId))
    .returning();
  if (!row) throw new PlaceAccountNotFoundError(placeId);

  return toRecord(row);
};
