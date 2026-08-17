import type { FastifyInstance, FastifyReply } from 'fastify';

const GENERIC_ERROR_MESSAGE = 'אירעה שגיאה בשרת, נסו שוב מאוחר יותר';
const GENERIC_CLIENT_ERROR_MESSAGE = 'הבקשה לא הושלמה, בדקו ונסו שוב';

const getStatusCode = (error: unknown): number | undefined => {
  if (typeof error !== 'object' || error === null || !('statusCode' in error)) return undefined;
  const { statusCode } = error as { statusCode: unknown };
  return typeof statusCode === 'number' ? statusCode : undefined;
};

// The rate-limit plugin (and anything else that throws a 429) already set
// this header before throwing. Read it back rather than recomputing a wait
// time, so the message can never disagree with what the client is told to
// respect.
const getRetryAfterMinutes = (reply: FastifyReply): number | undefined => {
  // @fastify/rate-limit sets this header with a numeric value, not a
  // string, even though it renders as a string on the wire.
  const retryAfter = reply.getHeader('retry-after');
  const seconds = typeof retryAfter === 'number' ? retryAfter : typeof retryAfter === 'string' ? Number(retryAfter) : undefined;
  if (seconds === undefined || !Number.isFinite(seconds) || seconds <= 0) return undefined;
  return Math.ceil(seconds / 60);
};

// "Check your input and try again" is actively wrong advice for a rate
// limit: trying again is exactly what is failing, and nothing about the
// request itself is broken. This gets its own message and its own error
// code so the client (and the person reading it) can act correctly.
const rateLimitedMessage = (reply: FastifyReply): string => {
  const minutes = getRetryAfterMinutes(reply);
  if (minutes === undefined) return 'בוצעו יותר מדי ניסיונות, נסו שוב בעוד מספר דקות';
  if (minutes === 1) return 'בוצעו יותר מדי ניסיונות, נסו שוב בעוד דקה אחת';
  return `בוצעו יותר מדי ניסיונות, נסו שוב בעוד כ-${minutes} דקות`;
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

    if (statusCode === 429) {
      // Not an error-level event: a client hitting the limit is expected
      // traffic shaping working as intended, not a server fault.
      request.log.warn({ err: error }, 'rate limited');
      reply.status(429).send({ error: 'rate_limited', message: rateLimitedMessage(reply) });
      return;
    }

    if (statusCode !== undefined && statusCode >= 400 && statusCode < 500) {
      request.log.warn({ err: error }, 'client error');
      reply.status(statusCode).send({ error: 'request_failed', message: GENERIC_CLIENT_ERROR_MESSAGE });
      return;
    }

    request.log.error({ err: error }, 'unhandled error');
    reply.status(500).send({ error: 'internal_error', message: GENERIC_ERROR_MESSAGE });
  });
};
