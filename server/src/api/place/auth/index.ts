import type { FastifyInstance } from 'fastify';

import { requirePlaceAuth } from '../../../plugins/place-guard';
import * as authService from '../../../service/admin-auth/auth';
import { PLACE_SESSION_COOKIE_NAME } from '../../../service/admin-auth/consts';

// Login moved to the shared panel door: `POST /v1/panel/login`
// (`../../panel/auth`). This file keeps only what stays place-specific:
// logging out of, and reading, a session that door already created.
// Mirrors `api/rabbi/auth` exactly for the other panel role.
export const registerPlaceAuthRoutes = async (app: FastifyInstance): Promise<void> => {
  app.post('/v1/place/logout', async (request, reply) => {
    const token = request.cookies[PLACE_SESSION_COOKIE_NAME];
    const unsignedToken = token ? request.unsignCookie(token) : undefined;

    if (unsignedToken?.valid && unsignedToken.value) {
      await authService.logout(unsignedToken.value);
    }

    reply.clearCookie(PLACE_SESSION_COOKIE_NAME, { path: '/' });
    return reply.status(204).send();
  });

  app.get('/v1/place/me', { preHandler: requirePlaceAuth }, async (request, reply) => {
    // requirePlaceAuth already sent a 401 and returned when unauthenticated.
    if (!request.placeUser) return reply;
    return reply.send(request.placeUser);
  });
};
