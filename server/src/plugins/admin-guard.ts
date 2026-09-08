import type { FastifyReply, FastifyRequest } from 'fastify';

import * as authService from '../service/admin-auth/auth';
import { SESSION_COOKIE_NAME } from '../service/admin-auth/consts';
import { SessionInvalidError } from '../service/admin-auth/errors';

const UNAUTHENTICATED_MESSAGE = 'יש להתחבר כדי לבצע פעולה זו';

// Attach as a preHandler on any admin route that requires a logged-in
// user. On success, decorates `request.adminUser`; on failure, sends the
// 401 itself so callers do not need their own catch.
export const requireAdminAuth = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const token = request.cookies[SESSION_COOKIE_NAME];
  const unsignedToken = token ? request.unsignCookie(token) : undefined;

  if (!token || !unsignedToken?.valid || !unsignedToken.value) {
    reply.status(401).send({ error: 'unauthenticated', message: UNAUTHENTICATED_MESSAGE });
    return;
  }

  try {
    const user = await authService.resolveSession(unsignedToken.value);
    // Defense in depth: the admin and rabbi login flows use distinct
    // cookies, so a rabbi's session should never even reach here, but a
    // role check at the guard means a future bug in cookie handling still
    // cannot let a rabbi's session pass as an administrator's.
    if (user.role !== 'admin') {
      reply.status(401).send({ error: 'unauthenticated', message: UNAUTHENTICATED_MESSAGE });
      return;
    }
    request.adminUser = { id: user.id, email: user.email, name: user.name, isSuper: user.isSuper };
  } catch (error) {
    if (error instanceof SessionInvalidError) {
      reply.status(401).send({ error: 'unauthenticated', message: UNAUTHENTICATED_MESSAGE });
      return;
    }
    throw error;
  }
};

const SUPER_ADMIN_REQUIRED_MESSAGE = 'רק מנהל-על יכול לגשת לפעולה זו';

// Attach after `requireAdminAuth` in the same `preHandler` array. Relies on
// `requireAdminAuth` having already populated `request.adminUser`; it does
// not authenticate on its own.
export const requireSuperAdmin = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  if (!request.adminUser?.isSuper) {
    reply.status(403).send({ error: 'super_admin_required', message: SUPER_ADMIN_REQUIRED_MESSAGE });
    return;
  }
};
