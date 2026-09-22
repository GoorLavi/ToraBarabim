import { eq } from 'drizzle-orm';

import type { AdminRole } from '../../db/schema/enums';
import { db } from '../../db/client';
import { adminUsers, places } from '../../db/schema';
import { AccountDeactivatedError, InvalidCredentialsError } from './errors';
import type { AuthenticatedAdminUser, LoginRequest } from './models';
import { getDummyPasswordHash, verifyPassword } from './password';
import { createSession, deleteSession, resolveSession, type CreatedSession } from './session';

export interface LoginResult {
  user: AuthenticatedAdminUser;
  session: CreatedSession;
}

// A place account's own `isActive` is read in the same query as the
// account row, left-joined since only a 'place' row ever carries a
// `placeId`: see the place check below.
const loginSelection = {
  id: adminUsers.id,
  email: adminUsers.email,
  username: adminUsers.username,
  passwordHash: adminUsers.passwordHash,
  name: adminUsers.name,
  role: adminUsers.role,
  rabbiId: adminUsers.rabbiId,
  placeId: adminUsers.placeId,
  isActive: adminUsers.isActive,
  isSuper: adminUsers.isSuper,
  placeIsActive: places.isActive,
};

const findLoginRow = (matchColumn: typeof adminUsers.email | typeof adminUsers.username, identifier: string) =>
  db
    .select(loginSelection)
    .from(adminUsers)
    .leftJoin(places, eq(adminUsers.placeId, places.id))
    .where(eq(matchColumn, identifier))
    .limit(1);

type LoginRow = Awaited<ReturnType<typeof findLoginRow>>[number];

// `expectedRole` scopes login to the admin or the rabbi door, each still
// its own role-locked route. `undefined` is the shared panel door
// (`POST /v1/panel/login`): it accepts either 'rabbi' or 'place' but
// refuses 'admin' outright, since only the untouched admin door may ever
// issue an admin session. Either way a credential that is valid but wrong
// for the door fails with the exact same `InvalidCredentialsError` as a
// wrong password, so no door ever reveals that an email is registered
// under a role it does not accept.
// Looked up by email first, username only as a fallback, rather than one
// `OR` query: a nondeterministic single query could return either row if
// one account's email happened to equal another's username, silently
// locking out the real email owner. Trying email to exhaustion first
// means a colliding username elsewhere can never shadow it.
export const login = async ({ identifier, password }: LoginRequest, expectedRole?: AdminRole): Promise<LoginResult> => {
  const byEmail = await findLoginRow(adminUsers.email, identifier);
  const byUsername = byEmail[0] ? [] : await findLoginRow(adminUsers.username, identifier);
  const row: LoginRow | undefined = byEmail[0] ?? byUsername[0];

  // Always run a verification, even for an unknown email, against a dummy
  // hash of the same shape, so the response time cannot be used to probe
  // which emails are registered.
  const isPasswordValid = await verifyPassword(password, row?.passwordHash ?? (await getDummyPasswordHash()));

  const roleRejected = expectedRole ? row?.role !== expectedRole : row?.role === 'admin';

  // Inactive is checked only after the password and the role, never
  // before, so the dummy-hash verification above still runs for an unknown
  // identifier and response timing does not change between "wrong
  // password" and "correct password, deactivated account".
  if (!row || !isPasswordValid || roleRejected) {
    throw new InvalidCredentialsError();
  }

  // A place account is inactive if either its own row is, or the place it
  // manages is: a place owner must never get a successful login followed
  // by a confusing 401 from the guard once the place itself is deactivated.
  const isDeactivated = !row.isActive || (row.role === 'place' && !row.placeIsActive);
  if (isDeactivated) throw new AccountDeactivatedError(row.id);

  const user: AuthenticatedAdminUser = {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    rabbiId: row.rabbiId ?? undefined,
    placeId: row.placeId ?? undefined,
    isActive: row.isActive,
    isSuper: row.isSuper,
    passwordHash: row.passwordHash,
  };

  const session = await createSession(user.id);

  return { user, session };
};

export { deleteSession as logout, resolveSession };
