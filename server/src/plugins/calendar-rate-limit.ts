import type { FastifyRequest } from 'fastify';

import { visitorFromForwardedFor } from './login-rate-limit';
import { CALENDAR_RATE_LIMIT_MAX, CALENDAR_RATE_LIMIT_WINDOW_MS, CALENDAR_VISITOR_POSITION_FROM_RIGHT } from './consts';

// Module state on purpose: the count is a property of the deployment's proxy
// chain, not of a request, so logging it on every calendar fetch would only
// bury the one line that confirms the position.
let hasLoggedComponentCount = false;

// Fail-closed, like the login key: a header too short to name the visitor
// falls back to `request.ip`, which shares a bucket instead of letting a
// forged header mint a fresh one. The ceiling in consts.ts is what keeps
// that shared bucket from throttling real calendar apps.
export const calendarRateLimitKey = (request: FastifyRequest): string => {
  const { componentCount, visitor } = visitorFromForwardedFor(request.headers['x-forwarded-for'], CALENDAR_VISITOR_POSITION_FROM_RIGHT);

  if (!hasLoggedComponentCount) {
    hasLoggedComponentCount = true;
    request.log.info({ forwardedForComponents: componentCount }, 'calendar rate limit key');
  }

  return visitor ?? request.ip;
};

export const calendarRateLimit = {
  max: CALENDAR_RATE_LIMIT_MAX,
  timeWindow: CALENDAR_RATE_LIMIT_WINDOW_MS,
  keyGenerator: calendarRateLimitKey,
};
