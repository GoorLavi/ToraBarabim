import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';

import rateLimit from '@fastify/rate-limit';
import Fastify, { type FastifyInstance } from 'fastify';

import { loginRateLimit } from '../src/plugins/login-rate-limit';
import { LOGIN_RATE_LIMIT_MAX } from '../src/service/admin-auth/consts';

// The real login routes need a database; the bucket key and limits are the
// shared `loginRateLimit` config, so a stub route carrying it exercises the
// same thing without one.
describe('login rate limit: per-visitor buckets behind the proxy chain', () => {
  let app: FastifyInstance;

  const attempt = (forwardedFor?: string) =>
    app.inject({
      method: 'POST',
      url: '/login',
      remoteAddress: '10.0.0.1',
      headers: forwardedFor === undefined ? {} : { 'x-forwarded-for': forwardedFor },
    });

  before(async () => {
    app = Fastify({ logger: false });
    await app.register(rateLimit, { global: false });
    app.post('/login', { config: { rateLimit: loginRateLimit } }, async () => ({ ok: true }));
    await app.ready();
  });

  after(async () => {
    await app.close();
  });

  test('one visitor exhausting the limit does not lock out another with a different header', async () => {
    for (let i = 0; i < LOGIN_RATE_LIMIT_MAX; i += 1) {
      assert.equal((await attempt('1.1.1.1, 9.9.9.9, 8.8.8.8')).statusCode, 200);
    }
    assert.equal((await attempt('1.1.1.1, 9.9.9.9, 8.8.8.8')).statusCode, 429);
    assert.equal((await attempt('2.2.2.2, 7.7.7.7, 8.8.8.8')).statusCode, 200);
  });

  test('entries to the left of the visitor position cannot mint a fresh bucket', async () => {
    for (let i = 0; i < LOGIN_RATE_LIMIT_MAX; i += 1) {
      await attempt(`forged-${i}, 3.3.3.3, 8.8.8.8`);
    }
    assert.equal((await attempt('forged-new, 3.3.3.3, 8.8.8.8')).statusCode, 429);
  });

  test('a missing header falls back to the connection address and shares one bucket', async () => {
    for (let i = 0; i < LOGIN_RATE_LIMIT_MAX; i += 1) {
      assert.equal((await attempt()).statusCode, 200);
    }
    assert.equal((await attempt()).statusCode, 429);
    assert.equal((await attempt('only-one-entry')).statusCode, 429);
  });
});
