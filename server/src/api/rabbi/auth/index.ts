import type { FastifyInstance } from 'fastify';

import { requireRabbiAuth } from '../../../plugins/rabbi-guard';
import * as authService from '../../../service/admin-auth/auth';
import { RABBI_SESSION_COOKIE_NAME } from '../../../service/admin-auth/consts';

// Login moved to the shared panel door: `POST /v1/panel/login`
// (`../../panel/auth`). This file keeps only what stays rabbi-specific:
// logging out of, and reading, a session that door already created.
export const registerRabbiAuthRoutes = async (app: FastifyInstance): Promise<void> => {
  app.post('/v1/rabbi/logout', async (request, reply) => {
    const token = request.cookies[RABBI_SESSION_COOKIE_NAME];
    const unsignedToken = token ? request.unsignCookie(token) : undefined;

    if (unsignedToken?.valid && unsignedToken.value) {
      await authService.logout(unsignedToken.value);
    }

    reply.clearCookie(RABBI_SESSION_COOKIE_NAME, { path: '/' });
    return reply.status(204).send();
  });

  app.get('/v1/rabbi/me', { preHandler: requireRabbiAuth }, async (request, reply) => {
    // requireRabbiAuth already sent a 401 and returned when unauthenticated.
    if (!request.rabbiUser) return reply;
    return reply.send(request.rabbiUser);
  });
};
