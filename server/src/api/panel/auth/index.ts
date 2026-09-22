import type { PanelLoginResponse } from '@torabarabim/common';
import type { FastifyInstance, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

import { loadConfig } from '../../../config';
import * as authService from '../../../service/admin-auth/auth';
import { LOGIN_RATE_LIMIT_MAX, LOGIN_RATE_LIMIT_WINDOW_MS, PLACE_SESSION_COOKIE_NAME, RABBI_SESSION_COOKIE_NAME } from '../../../service/admin-auth/consts';
import { AccountDeactivatedError, InvalidCredentialsError } from '../../../service/admin-auth/errors';
import { resolveLandingPath } from '../../../service/admin-auth/landing-path';
import { panelLoginRequestSchema } from '../../../service/admin-auth/models';

const GENERIC_ERROR_MESSAGE = 'אירעה שגיאה בשרת, נסו שוב מאוחר יותר';
const INVALID_CREDENTIALS_MESSAGE = 'אימייל או סיסמה שגויים';
const ACCOUNT_DEACTIVATED_MESSAGE = 'החשבון אינו פעיל. אפשר לפנות למי שהקים אותו כדי להפעיל אותו מחדש.';

const handleError = (reply: FastifyReply, error: unknown, routeLabel: string): FastifyReply => {
  if (error instanceof ZodError) {
    return reply.status(400).send({ error: 'invalid_request', message: 'הבקשה אינה תקינה', details: error.flatten() });
  }

  if (error instanceof InvalidCredentialsError) {
    return reply.status(401).send({ error: 'invalid_credentials', message: INVALID_CREDENTIALS_MESSAGE });
  }

  if (error instanceof AccountDeactivatedError) {
    return reply.status(403).send({ error: 'account_deactivated', message: ACCOUNT_DEACTIVATED_MESSAGE });
  }

  reply.request.log.error({ err: error }, `unhandled error in ${routeLabel}`);
  return reply.status(500).send({ error: 'internal_error', message: GENERIC_ERROR_MESSAGE });
};

// The one shared login door for a rabbi or a place account. The admin
// login stays exactly where it is (`POST /v1/admin/login`): it is untouched
// and out of scope here.
export const registerPanelAuthRoutes = async (app: FastifyInstance): Promise<void> => {
  const config = loadConfig(process.env);
  const isProduction = process.env.NODE_ENV === 'production';

  const setSessionCookie = (reply: FastifyReply, cookieName: string, token: string): void => {
    reply.cookie(cookieName, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      path: '/',
      signed: true,
      maxAge: config.sessionTtlHours * 60 * 60,
    });
  };

  app.post(
    '/v1/panel/login',
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
        const body = panelLoginRequestSchema.parse(request.body);
        // No `expectedRole`: `login` reads the row's own role and refuses
        // 'admin' outright, so the only roles that can reach this point are
        // 'rabbi' and 'place'.
        const { user, session } = await authService.login(body);

        if (user.role === 'admin') {
          // Unreachable: `login` without `expectedRole` already refuses
          // 'admin'. Kept so the compiler, not just the service, rejects a
          // future change that lets an admin session through here.
          throw new Error('login unexpectedly returned an admin user through the shared panel door');
        }

        const cookieName = user.role === 'rabbi' ? RABBI_SESSION_COOKIE_NAME : PLACE_SESSION_COOKIE_NAME;
        setSessionCookie(reply, cookieName, session.token);

        const landingPath = resolveLandingPath(user.role, body.from);
        const response: PanelLoginResponse = { name: user.name, landingPath };
        return reply.send(response);
      } catch (error) {
        return handleError(reply, error, 'POST /v1/panel/login');
      }
    },
  );
};
