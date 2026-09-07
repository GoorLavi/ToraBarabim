import type { FastifyReply, FastifyRequest } from 'fastify';

import * as authService from '../service/admin-auth/auth';
import { RABBI_SESSION_COOKIE_NAME } from '../service/admin-auth/consts';
import { SessionInvalidError } from '../service/admin-auth/errors';

const UNAUTHENTICATED_MESSAGE = 'יש להתחבר כדי לבצע פעולה זו';

// Attach as a preHandler on any rabbi route that requires a logged-in
// rabbi. On success, decorates `request.rabbiUser`; on failure, sends the
// 401 itself so callers do not need their own catch. Reads a distinct
// cookie from the admin guard, and additionally checks `role === 'rabbi'`
// so an administrator's session, even if somehow presented here, is
// rejected rather than treated as a rabbi with no `rabbiId`.
export const requireRabbiAuth = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const token = request.cookies[RABBI_SESSION_COOKIE_NAME];
  const unsignedToken = token ? request.unsignCookie(token) : undefined;

  if (!token || !unsignedToken?.valid || !unsignedToken.value) {
    reply.status(401).send({ error: 'unauthenticated', message: UNAUTHENTICATED_MESSAGE });
    return;
  }

  try {
    const user = await authService.resolveSession(unsignedToken.value);
    if (user.role !== 'rabbi' || !user.rabbiId) {
      reply.status(401).send({ error: 'unauthenticated', message: UNAUTHENTICATED_MESSAGE });
      return;
    }
    request.rabbiUser = { id: user.id, email: user.email, name: user.name, rabbiId: user.rabbiId };
  } catch (error) {
    if (error instanceof SessionInvalidError) {
      reply.status(401).send({ error: 'unauthenticated', message: UNAUTHENTICATED_MESSAGE });
      return;
    }
    throw error;
  }
};
