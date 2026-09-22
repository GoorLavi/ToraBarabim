import type { FastifyReply, FastifyRequest } from 'fastify';

import * as authService from '../service/admin-auth/auth';
import { PLACE_SESSION_COOKIE_NAME } from '../service/admin-auth/consts';
import { SessionInvalidError } from '../service/admin-auth/errors';
import * as placeService from '../service/place/place';

const UNAUTHENTICATED_MESSAGE = 'יש להתחבר כדי לבצע פעולה זו';

// Attach as a preHandler on any place route that requires a logged-in
// place owner. On success, decorates `request.placeUser`; on failure,
// sends the 401 itself so callers do not need their own catch. Reads a
// distinct cookie from the admin and rabbi guards, and additionally checks
// `role === 'place'` so another role's session, even if somehow presented
// here, is rejected rather than treated as a place owner with no
// `placeId`.
export const requirePlaceAuth = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
  const token = request.cookies[PLACE_SESSION_COOKIE_NAME];
  const unsignedToken = token ? request.unsignCookie(token) : undefined;

  if (!token || !unsignedToken?.valid || !unsignedToken.value) {
    reply.status(401).send({ error: 'unauthenticated', message: UNAUTHENTICATED_MESSAGE });
    return;
  }

  try {
    const user = await authService.resolveSession(unsignedToken.value);
    if (user.role !== 'place' || !user.placeId) {
      reply.status(401).send({ error: 'unauthenticated', message: UNAUTHENTICATED_MESSAGE });
      return;
    }
    // `resolveSession` only checks the account row (`admin_users.is_active`),
    // shared by all three guards, so it cannot also check the place without
    // costing every admin and rabbi request a join they do not need. Checked
    // here instead, on this role alone: per 0034, deactivating a place is
    // the whole delete mechanism, so an owner whose place was deactivated
    // after they logged in must lose the session, not keep managing lessons
    // for a place the directory and its own page already treat as gone.
    if (!(await placeService.isActive(user.placeId))) {
      reply.status(401).send({ error: 'unauthenticated', message: UNAUTHENTICATED_MESSAGE });
      return;
    }
    request.placeUser = { id: user.id, email: user.email, name: user.name, placeId: user.placeId };
  } catch (error) {
    if (error instanceof SessionInvalidError) {
      reply.status(401).send({ error: 'unauthenticated', message: UNAUTHENTICATED_MESSAGE });
      return;
    }
    throw error;
  }
};
