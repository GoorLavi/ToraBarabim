import { eq } from 'drizzle-orm';

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

export const login = async ({ email, password }: LoginRequest): Promise<LoginResult> => {
  const rows = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);
  const row = rows[0];

  // Always run a verification, even for an unknown email, against a dummy
  // hash of the same shape, so the response time cannot be used to probe
  // which emails are registered.
  const isPasswordValid = await verifyPassword(password, row?.passwordHash ?? (await getDummyPasswordHash()));

  if (!row || !row.isActive || !isPasswordValid) {
    throw new InvalidCredentialsError();
  }

  const user: AuthenticatedAdminUser = {
    id: row.id,
    email: row.email,
    name: row.name,
    isActive: row.isActive,
    passwordHash: row.passwordHash,
  };

  const session = await createSession(user.id);

  return { user, session };
};

export { deleteSession as logout, resolveSession };
