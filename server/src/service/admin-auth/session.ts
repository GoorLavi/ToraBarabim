import { createHash, randomBytes } from 'node:crypto';

import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { db } from '../../db/client';
import { adminSessions, adminUsers } from '../../db/schema';
import { loadConfig } from '../../config';
import { SessionInvalidError } from './errors';
import type { AuthenticatedAdminUser } from './models';

const SESSION_TOKEN_BYTES = 32;

const hashToken = (token: string): string => createHash('sha256').update(token).digest('hex');

export interface CreatedSession {
  token: string;
  expiresAt: Date;
}

export const createSession = async (userId: string): Promise<CreatedSession> => {
  const { sessionTtlHours } = loadConfig(process.env);
  const token = randomBytes(SESSION_TOKEN_BYTES).toString('hex');
  const expiresAt = new Date(Date.now() + sessionTtlHours * 60 * 60 * 1000);

  await db.insert(adminSessions).values({
    id: nanoid(),
    userId,
    tokenHash: hashToken(token),
    expiresAt,
  });

  return { token, expiresAt };
};

// Resolves a raw cookie token to the user it belongs to. An expired
// session is deleted here, not just rejected, so it never lingers as a
// stale row.
export const resolveSession = async (token: string): Promise<AuthenticatedAdminUser> => {
  const tokenHash = hashToken(token);

  const rows = await db
    .select({
      sessionId: adminSessions.id,
      expiresAt: adminSessions.expiresAt,
      id: adminUsers.id,
      email: adminUsers.email,
      name: adminUsers.name,
      isActive: adminUsers.isActive,
      passwordHash: adminUsers.passwordHash,
    })
    .from(adminSessions)
    .innerJoin(adminUsers, eq(adminSessions.userId, adminUsers.id))
    .where(eq(adminSessions.tokenHash, tokenHash))
    .limit(1);

  const row = rows[0];
  if (!row) throw new SessionInvalidError();

  if (row.expiresAt.getTime() <= Date.now()) {
    await db.delete(adminSessions).where(eq(adminSessions.id, row.sessionId));
    throw new SessionInvalidError();
  }

  if (!row.isActive) throw new SessionInvalidError();

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    isActive: row.isActive,
    passwordHash: row.passwordHash,
  };
};

export const deleteSession = async (token: string): Promise<void> => {
  await db.delete(adminSessions).where(eq(adminSessions.tokenHash, hashToken(token)));
};
