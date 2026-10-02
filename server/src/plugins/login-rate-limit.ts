import type { FastifyRequest } from 'fastify';

import { LOGIN_RATE_LIMIT_MAX, LOGIN_RATE_LIMIT_WINDOW_MS } from '../service/admin-auth/consts';

// Behind CloudFront, API Gateway and the VPC Link, `request.ip` is the
// proxy's address, so one shared bucket would lock everyone out after a few
// failed attempts. Each hop appends the address it saw to X-Forwarded-For,
// and the entry second from the right is the visitor as seen by the first
// hop we operate; anything to its left is client-supplied and spoofable.
// `trustProxy` is deliberately not set globally: it would change `request.ip`
// for every route, and this is the only one that needs it.
// Fail-closed: a missing or short header falls back to `request.ip`, which
// shares a bucket instead of letting a forged header mint a fresh one.
// The position cannot be verified outside production; the logged component
// count is how to confirm it after the first deploy.
const VISITOR_POSITION_FROM_RIGHT = 2;

export const visitorRateLimitKey = (request: FastifyRequest): string => {
  const header = request.headers['x-forwarded-for'];
  const components = (Array.isArray(header) ? header.join(',') : (header ?? ''))
    .split(',')
    .map((component) => component.trim())
    .filter((component) => component.length > 0);

  request.log.info({ forwardedForComponents: components.length }, 'login rate limit key');

  const visitor = components[components.length - VISITOR_POSITION_FROM_RIGHT];
  return visitor ?? request.ip;
};

export const loginRateLimit = {
  max: LOGIN_RATE_LIMIT_MAX,
  timeWindow: LOGIN_RATE_LIMIT_WINDOW_MS,
  keyGenerator: visitorRateLimitKey,
};
