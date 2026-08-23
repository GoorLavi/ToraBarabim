import type { RabbiSessionUser } from '@torabarabim/common';
import type { FastifyInstance, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

import { loadConfig } from '../../../config';
import { requireRabbiAuth } from '../../../plugins/rabbi-guard';
import * as authService from '../../../service/admin-auth/auth';
import { LOGIN_RATE_LIMIT_MAX, LOGIN_RATE_LIMIT_WINDOW_MS, RABBI_SESSION_COOKIE_NAME } from '../../../service/admin-auth/consts';
import { InvalidCredentialsError } from '../../../service/admin-auth/errors';
import { loginRequestSchema } from '../../../service/admin-auth/models';

const GENERIC_ERROR_MESSAGE = 'אירעה שגיאה בשרת, נסו שוב מאוחר יותר';
const INVALID_CREDENTIALS_MESSAGE = 'אימייל או סיסמה שגויים';

const handleError = (reply: FastifyReply, error: unknown, routeLabel: string): FastifyReply => {
  if (error instanceof ZodError) {
    return reply.status(400).send({ error: 'invalid_request', message: 'הבקשה אינה תקינה', details: error.flatten() });
  }

  if (error instanceof InvalidCredentialsError) {
    return reply.status(401).send({ error: 'invalid_credentials', message: INVALID_CREDENTIALS_MESSAGE });
  }

  reply.request.log.error({ err: error }, `unhandled error in ${routeLabel}`);
  return reply.status(500).send({ error: 'internal_error', message: GENERIC_ERROR_MESSAGE });
};

export const registerRabbiAuthRoutes = async (app: FastifyInstance): Promise<void> => {
  const config = loadConfig(process.env);
  const isProduction = process.env.NODE_ENV === 'production';

  const setSessionCookie = (reply: FastifyReply, token: string): void => {
    reply.cookie(RABBI_SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      path: '/',
      signed: true,
      maxAge: config.sessionTtlHours * 60 * 60,
    });
  };

  app.post(
    '/v1/rabbi/login',
    {
      config: {
        rateLimit: {
          max: LOGIN_RATE_LIMIT_MAX,
          timeWindow: LOGIN_RATE_LIMIT_WINDOW_MS,
        },
      },
    },
    async (request, reply) => {
      try {
        const body = loginRequestSchema.parse(request.body);
        const { user, session } = await authService.login(body, 'rabbi');
        setSessionCookie(reply, session.token);
        // `login` throws InvalidCredentialsError above whenever the role
        // does not match, so `user.rabbiId` is always set here.
        const rabbiUser: RabbiSessionUser = { id: user.id, email: user.email, name: user.name, rabbiId: user.rabbiId as string };
        return reply.send(rabbiUser);
      } catch (error) {
        return handleError(reply, error, 'POST /v1/rabbi/login');
      }
    },
  );

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
