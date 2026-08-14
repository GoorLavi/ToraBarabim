import type { FastifyInstance } from 'fastify';

const GENERIC_ERROR_MESSAGE = 'אירעה שגיאה בשרת, נסו שוב מאוחר יותר';
const GENERIC_CLIENT_ERROR_MESSAGE = 'הבקשה לא הושלמה, בדקו ונסו שוב';

const getStatusCode = (error: unknown): number | undefined => {
  if (typeof error !== 'object' || error === null || !('statusCode' in error)) return undefined;
  const { statusCode } = error as { statusCode: unknown };
  return typeof statusCode === 'number' ? statusCode : undefined;
};

// Last resort for anything a route's own handleError missed. A route's own
// try/catch never sees an error thrown by a hook that runs before its
// handler (rate limiting, multipart size limits, and similar plugin
// checks), so those land here instead. When the error already carries a
// 4xx, that status is honoured as-is: the framework already knows the
// client did something wrong, and forcing it to 500 would tell the person
// the server is broken and fill the log with "unhandled error" for
// something that is not an error. A route still owns a more specific
// domain error and its own Hebrew message; this is a generic fallback.
export const registerErrorHandler = (app: FastifyInstance): void => {
  app.setErrorHandler((error, request, reply) => {
    const statusCode = getStatusCode(error);

    if (statusCode !== undefined && statusCode >= 400 && statusCode < 500) {
      request.log.warn({ err: error }, 'client error');
      reply.status(statusCode).send({ error: 'request_failed', message: GENERIC_CLIENT_ERROR_MESSAGE });
      return;
    }

    request.log.error({ err: error }, 'unhandled error');
    reply.status(500).send({ error: 'internal_error', message: GENERIC_ERROR_MESSAGE });
  });
};
