import { eq } from 'drizzle-orm';

import type { AdminRole } from '../../db/schema/enums';
import { db } from '../../db/client';
import { adminUsers } from '../../db/schema';
import { InvalidCredentialsError } from './errors';
import type { AuthenticatedAdminUser, LoginRequest } from './models';
import { getDummyPasswordHash, verifyPassword } from './password';
import { createSession, deleteSession, resolveSession, type CreatedSession } from './session';

export interface LoginResult {
  user: AuthenticatedAdminUser;
  session: CreatedSession;
}

// `expectedRole` scopes login to one of the two separate front doors
// (administrator vs rabbi). A credential that is valid but belongs to the
// other role fails with the exact same `InvalidCredentialsError` as a
// wrong password, so neither login route ever reveals that an email is
// registered under the other role.
// Looked up by email first, username only as a fallback, rather than one
// `OR` query: a nondeterministic single query could return either row if
// one account's email happened to equal another's username, silently
// locking out the real email owner. Trying email to exhaustion first
// means a colliding username elsewhere can never shadow it.
export const login = async ({ identifier, password }: LoginRequest, expectedRole: AdminRole): Promise<LoginResult> => {
  const byEmail = await db.select().from(adminUsers).where(eq(adminUsers.email, identifier)).limit(1);
  const byUsername = byEmail[0] ? [] : await db.select().from(adminUsers).where(eq(adminUsers.username, identifier)).limit(1);
  const row = byEmail[0] ?? byUsername[0];

  // Always run a verification, even for an unknown email, against a dummy
  // hash of the same shape, so the response time cannot be used to probe
  // which emails are registered.
  const isPasswordValid = await verifyPassword(password, row?.passwordHash ?? (await getDummyPasswordHash()));

  if (!row || !row.isActive || !isPasswordValid || row.role !== expectedRole) {
    throw new InvalidCredentialsError();
  }

  const user: AuthenticatedAdminUser = {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    rabbiId: row.rabbiId ?? undefined,
    isActive: row.isActive,
    isSuper: row.isSuper,
    passwordHash: row.passwordHash,
  };

  const session = await createSession(user.id);

  return { user, session };
};

export { deleteSession as logout, resolveSession };
