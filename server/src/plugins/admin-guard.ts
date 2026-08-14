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
    request.adminUser = { id: user.id, email: user.email, name: user.name };
  } catch (error) {
    if (error instanceof SessionInvalidError) {
      reply.status(401).send({ error: 'unauthenticated', message: UNAUTHENTICATED_MESSAGE });
      return;
    }
    throw error;
  }
};
