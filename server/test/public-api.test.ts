import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';

import type { City, HomeResponse, LessonOccurrence, LessonSearchResponse, RabbiDirectoryEntry, RabbiDirectoryResponse } from '@torabarabim/common';
import Fastify, { type FastifyInstance } from 'fastify';

import { registerCityRoutes } from '../src/api/cities';
import { registerHealthRoutes } from '../src/api/health';
import { registerHomeRoutes } from '../src/api/home';
import { registerLessonRoutes } from '../src/api/lessons';
import { registerRabbiDirectoryRoutes } from '../src/api/rabbis';
import { db } from '../src/db/client';
import { registerErrorHandler } from '../src/plugins/error-handler';
import { nextDateOnWeekday, todayInIsrael } from '../src/service/lesson/israel-time';
import { toSlug } from '../src/service/shared/slug';

// `db`'s exported type (`server/src/db/client.ts`) is annotated as
// `PostgresJsDatabase`, which omits `$client`, but drizzle-orm's postgres-js
// adapter always attaches the underlying `postgres` client under that key at
// runtime. Needed here only to ping the database and to close the pool so
// `node --test` can exit on its own.
type RawPostgresClient = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<unknown>;
const rawClient = (db as unknown as { $client: RawPostgresClient & { end: (options?: { timeout?: number }) => Promise<void> } }).$client;

// A missing or unreachable database must fail the whole suite loudly, with a
// fix in hand, rather than have every test time out or fail with an opaque
// connection error one at a time.
const assertDatabaseReachable = async (): Promise<void> => {
  try {
    await rawClient`select 1`;
  } catch (cause) {
    throw new Error(
      'Expected a reachable, seeded Postgres at DATABASE_URL for the public API suite. ' +
        'Run `npm run db:up && npm run db:migrate -w server && npm run db:seed -w server` first.',
      { cause },
    );
  }
};

// Mirrors the public routes `src/index.ts` registers, minus what a browser
// needs (CORS, cookies, multipart, rate limiting) and everything behind
// auth: none of that is reachable through `app.inject`, and it is not part
// of the public surface this suite exists to protect.
const buildApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({ logger: false });
  await registerHealthRoutes(app);
  await registerLessonRoutes(app);
  await registerHomeRoutes(app);
  await registerCityRoutes(app);
  await registerRabbiDirectoryRoutes(app);
  registerErrorHandler(app);
  return app;
};

// The seeded rabbi and lesson ids/names this suite asserts against; see
// `server/src/db/seed/lessons.ts`. Kept close to the assertions that use
// them rather than re-derived, since the seed data is fixed test fixture,
// not something under test.
const SEEDED_RABBI_ID = 'rabbi-1';
const SEEDED_RABBI_NAME = 'הרב אברהם כהן';
const SUNDAY_TO_THURSDAY_LESSON_ID = 'lesson-1';
const SEEDED_CITY_NAME = 'ירושלים';
const SEEDED_CITY_PREFIX = 'ירוש';
const SEEDED_CITY_RABBI_ID = 'rabbi-3';
const SEEDED_CITY_RABBI_NAME = 'הרב יעקב מזרחי';

describe('public API', () => {
  let app: FastifyInstance;

  before(async () => {
    await assertDatabaseReachable();
    app = await buildApp();
  });

  after(async () => {
    await app.close();
    await rawClient.end({ timeout: 5 });
  });

  test('GET /health reports ok', async () => {
    const res = await app.inject({ method: 'GET', url: '/health' });
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.json(), { status: 'ok' });
  });

  describe('GET /v1/lessons', () => {
    test('returns a paged, correctly shaped result for the default search', async () => {
      const res = await app.inject({ method: 'GET', url: '/v1/lessons' });
      assert.equal(res.statusCode, 200);

      const body = res.json() as LessonSearchResponse;
      assert.equal(body.page, 1);
      assert.equal(body.pageSize, 20);
      assert.ok(Array.isArray(body.items));
      assert.ok(body.total > 0, 'expected the seeded weekly lessons to produce an occurrence in the default 7-day range');
      assert.ok(body.items.length > 0);

      const [occurrence] = body.items as [LessonOccurrence];
      assert.equal(typeof occurrence.lessonId, 'string');
      assert.match(occurrence.date, /^\d{4}-\d{2}-\d{2}$/);
      assert.match(occurrence.startTime, /^\d{2}:\d{2}$/);
      assert.match(occurrence.endTime, /^\d{2}:\d{2}$/);
      assert.ok(occurrence.status === 'scheduled' || occurrence.status === 'cancelled');
      assert.equal(typeof occurrence.rabbi.id, 'string');
      assert.equal(typeof occurrence.rabbi.name, 'string');
      assert.equal(typeof occurrence.place.name, 'string');
      assert.equal(typeof occurrence.place.city, 'string');
      assert.equal(typeof occurrence.place.area, 'string');
    });

    test('a filter matching nothing is a normal 200 with an empty list, never a 404', async () => {
      const res = await app.inject({ method: 'GET', url: '/v1/lessons?city=999999999' });
      assert.equal(res.statusCode, 200);
      const body = res.json() as LessonSearchResponse;
      assert.deepEqual(body.items, []);
      assert.equal(body.total, 0);
    });

    test('rejects a page size outside the allowed bounds', async () => {
      const zero = await app.inject({ method: 'GET', url: '/v1/lessons?pageSize=0' });
      assert.equal(zero.statusCode, 400);

      const tooLarge = await app.inject({ method: 'GET', url: '/v1/lessons?pageSize=1000' });
      assert.equal(tooLarge.statusCode, 400);
    });

    test('rejects a malformed date', async () => {
      const res = await app.inject({ method: 'GET', url: '/v1/lessons?from=not-a-date' });
      assert.equal(res.statusCode, 400);
    });

    test('rejects a range where "to" is before "from"', async () => {
      const res = await app.inject({ method: 'GET', url: '/v1/lessons?from=2026-09-20&to=2026-09-10' });
      assert.equal(res.statusCode, 400);
    });

    test('rejects an area outside the known enum', async () => {
      const res = await app.inject({ method: 'GET', url: '/v1/lessons?area=atlantis' });
      assert.equal(res.statusCode, 400);
    });
  });

  describe('GET /v1/lessons/:lessonId/occurrences/:date', () => {
    test('resolves a real occurrence', async () => {
      // lesson-1 recurs Sunday through Thursday; the next Sunday is always
      // in range no matter what day the suite happens to run on.
      const date = nextDateOnWeekday(todayInIsrael(new Date()), 0);
      const res = await app.inject({ method: 'GET', url: `/v1/lessons/${SUNDAY_TO_THURSDAY_LESSON_ID}/occurrences/${date}` });
      assert.equal(res.statusCode, 200);

      const body = res.json() as LessonOccurrence;
      assert.equal(body.lessonId, SUNDAY_TO_THURSDAY_LESSON_ID);
      assert.equal(body.date, date);
      assert.equal(body.rabbi.id, 'rabbi-1');
      // A `Rabbi` embedded in another response (here, a lesson occurrence)
      // carries `slug` too, not only the standalone rabbi endpoints.
      assert.equal(body.rabbi.name, SEEDED_RABBI_NAME);
      assert.equal(body.rabbi.slug, toSlug(SEEDED_RABBI_NAME));
    });

    test('a genuinely missing lesson returns 404', async () => {
      const res = await app.inject({ method: 'GET', url: '/v1/lessons/does-not-exist/occurrences/2026-01-01' });
      assert.equal(res.statusCode, 404);
    });

    test('a lesson with no occurrence on the requested date returns 404', async () => {
      // lesson-1 never recurs on Saturday.
      const date = nextDateOnWeekday(todayInIsrael(new Date()), 6);
      const res = await app.inject({ method: 'GET', url: `/v1/lessons/${SUNDAY_TO_THURSDAY_LESSON_ID}/occurrences/${date}` });
      assert.equal(res.statusCode, 404);
    });

    test('rejects a malformed date param', async () => {
      const res = await app.inject({ method: 'GET', url: `/v1/lessons/${SUNDAY_TO_THURSDAY_LESSON_ID}/occurrences/not-a-date` });
      assert.equal(res.statusCode, 400);
    });
  });

  test('GET /v1/home returns every row correctly shaped', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/home' });
    assert.equal(res.statusCode, 200);

    const body = res.json() as HomeResponse;
    assert.ok(Array.isArray(body.rows));
    for (const row of body.rows) {
      assert.equal(typeof row.id, 'string');
      assert.equal(typeof row.title, 'string');
      assert.ok(Array.isArray(row.items));
    }
  });

  describe('GET /v1/cities', () => {
    test('an absent query is a normal 200 with an empty list, never a 404', async () => {
      const res = await app.inject({ method: 'GET', url: '/v1/cities' });
      assert.equal(res.statusCode, 200);
      assert.deepEqual((res.json() as { items: City[] }).items, []);
    });

    test('matches a known seeded city by prefix', async () => {
      const res = await app.inject({ method: 'GET', url: `/v1/cities?q=${encodeURIComponent(SEEDED_CITY_PREFIX)}` });
      assert.equal(res.statusCode, 200);
      const { items } = res.json() as { items: City[] };
      assert.ok(items.some((city) => city.name === SEEDED_CITY_NAME));
    });

    test('rejects a query over the length limit', async () => {
      const res = await app.inject({ method: 'GET', url: `/v1/cities?q=${'א'.repeat(101)}` });
      assert.equal(res.statusCode, 400);
    });
  });

  test('GET /v1/cities/directory groups only cities that have a lesson', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/cities/directory' });
    assert.equal(res.statusCode, 200);

    const body = res.json() as { areas: { area: string; areaName: string; cities: { lessonCount: number }[] }[] };
    assert.ok(body.areas.length > 0);
    for (const area of body.areas) {
      assert.ok(area.cities.length > 0);
      for (const city of area.cities) {
        assert.ok(city.lessonCount > 0);
      }
    }
  });

  describe('GET /v1/cities/:name', () => {
    test('resolves a seeded city with the rabbis teaching there', async () => {
      const res = await app.inject({ method: 'GET', url: `/v1/cities/${encodeURIComponent(SEEDED_CITY_NAME)}` });
      assert.equal(res.statusCode, 200);

      const body = res.json() as { name: string; areaName: string; rabbis: { id: string; name: string; slug: string }[] };
      assert.equal(body.name, SEEDED_CITY_NAME);
      assert.equal(typeof body.areaName, 'string');

      const rabbi = body.rabbis.find((candidate) => candidate.id === SEEDED_CITY_RABBI_ID);
      assert.ok(rabbi);
      // A `Rabbi` embedded in another response (here, a city's rabbi list)
      // carries `slug` too, not only the standalone rabbi endpoints.
      assert.equal(rabbi.name, SEEDED_CITY_RABBI_NAME);
      assert.equal(rabbi.slug, toSlug(SEEDED_CITY_RABBI_NAME));
    });

    test('a genuinely missing city returns 404', async () => {
      const res = await app.inject({ method: 'GET', url: '/v1/cities/עיר-שלא-קיימת-לעולם' });
      assert.equal(res.statusCode, 404);
    });
  });

  describe('GET /v1/rabbis', () => {
    test('returns a paged, correctly shaped directory', async () => {
      const res = await app.inject({ method: 'GET', url: '/v1/rabbis' });
      assert.equal(res.statusCode, 200);

      const body = res.json() as RabbiDirectoryResponse;
      assert.equal(body.page, 1);
      assert.equal(body.pageSize, 20);
      assert.ok(body.total >= 11, 'expected at least the 11 seeded rabbis');

      const rabbi = body.items.find((entry) => entry.id === SEEDED_RABBI_ID) as RabbiDirectoryEntry | undefined;
      assert.ok(rabbi);
      assert.ok(rabbi.lessonCount > 0);
      assert.ok(rabbi.cities.length > 0);
      assert.equal(typeof rabbi.slug, 'string');
      assert.ok(rabbi.slug.length > 0);
      assert.equal(rabbi.slug, toSlug(SEEDED_RABBI_NAME));
    });

    test('rejects a non-numeric page size', async () => {
      const res = await app.inject({ method: 'GET', url: '/v1/rabbis?pageSize=abc' });
      assert.equal(res.statusCode, 400);
    });
  });

  describe('GET /v1/rabbis/:rabbiId', () => {
    test('resolves a seeded rabbi', async () => {
      const res = await app.inject({ method: 'GET', url: `/v1/rabbis/${SEEDED_RABBI_ID}` });
      assert.equal(res.statusCode, 200);

      const body = res.json() as RabbiDirectoryEntry;
      assert.equal(body.id, SEEDED_RABBI_ID);
      assert.equal(body.name, SEEDED_RABBI_NAME);
      assert.ok(body.lessonCount > 0);
      assert.equal(typeof body.slug, 'string');
      assert.ok(body.slug.length > 0);
      assert.equal(body.slug, toSlug(SEEDED_RABBI_NAME));
    });

    test('a genuinely missing rabbi returns 404', async () => {
      const res = await app.inject({ method: 'GET', url: '/v1/rabbis/does-not-exist' });
      assert.equal(res.statusCode, 404);
    });
  });
});
