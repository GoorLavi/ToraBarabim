import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';

import type {
  CitySearchResult,
  CitySuggestionsResponse,
  HomeResponse,
  LessonOccurrence,
  LessonSearchResponse,
  RabbiDirectoryEntry,
  RabbiDirectoryResponse,
} from '@torabarabim/common';
import type { FastifyInstance } from 'fastify';

import { nextDateOnWeekday, todayInIsrael } from '../src/service/lesson/israel-time';
import { rabbiNameSchema, stripLeadingHonorific } from '../src/service/shared/name';
import { toSlug } from '../src/service/shared/slug';
import { assertClientBuilt, assertDatabaseReachable, buildApp, rawClient } from './app-harness';

// The seeded rabbi and lesson ids/names this suite asserts against; see
// `server/src/db/seed/lessons.ts`. Kept close to the assertions that use
// them rather than re-derived, since the seed data is fixed test fixture,
// not something under test. Names are bare (never carrying "הרב"/"הרבנית"):
// the client composes the display form from `name` and `honorific`.
const SEEDED_RABBI_ID = 'rabbi-1';
const SEEDED_RABBI_NAME = 'אברהם כהן';
const SUNDAY_TO_THURSDAY_LESSON_ID = 'lesson-1';
const SEEDED_CITY_NAME = 'ירושלים';
const SEEDED_CITY_PREFIX = 'ירוש';
const SEEDED_CITY_RABBI_ID = 'rabbi-3';
const SEEDED_CITY_RABBI_NAME = 'יעקב מזרחי';
const SEEDED_RABBANIT_ID = 'rabbi-9';
const SEEDED_RABBANIT_NAME = 'שרה גולדברג';

describe('public API', () => {
  let app: FastifyInstance;

  before(async () => {
    await Promise.all([assertDatabaseReachable(), assertClientBuilt()]);
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
      // The lesson page's "other lessons in this city" link is built from
      // this slug, so it reaches the city page directly instead of falling
      // back to a text search the way it did before the field existed.
      assert.equal(occurrence.place.citySlug, toSlug(occurrence.place.city));
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
      // The name is bare, and the client composes "הרב"/"הרבנית" from this.
      assert.equal(body.rabbi.honorific, 'rav');
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
      assert.deepEqual((res.json() as { items: CitySearchResult[] }).items, []);
    });

    test('matches a known seeded city by prefix, and carries its area name and lesson count', async () => {
      const res = await app.inject({ method: 'GET', url: `/v1/cities?q=${encodeURIComponent(SEEDED_CITY_PREFIX)}` });
      assert.equal(res.statusCode, 200);
      const { items } = res.json() as { items: CitySearchResult[] };
      const city = items.find((candidate) => candidate.name === SEEDED_CITY_NAME);
      assert.ok(city);
      assert.equal(typeof city.areaName, 'string');
      assert.ok(city.areaName.length > 0);
      assert.equal(typeof city.lessonCount, 'number');
      assert.ok(city.lessonCount > 0, 'the seeded city has seeded lessons');
    });

    test('rejects a query over the length limit', async () => {
      const res = await app.inject({ method: 'GET', url: `/v1/cities?q=${'א'.repeat(101)}` });
      assert.equal(res.statusCode, 400);
    });

    // An exact name match outranks every other tier (population, then name)
    // regardless of lesson count, so this pins the ordering the search's
    // two-step query (cities first, lesson counts joined in memory after)
    // must preserve.
    test('an exact name match is ordered first', async () => {
      const res = await app.inject({ method: 'GET', url: `/v1/cities?q=${encodeURIComponent(SEEDED_CITY_NAME)}` });
      assert.equal(res.statusCode, 200);
      const { items } = res.json() as { items: CitySearchResult[] };
      assert.ok(items.length > 0);
      assert.equal(items[0]?.name, SEEDED_CITY_NAME);
    });
  });

  test('GET /v1/cities/directory groups only cities that have a lesson, and every area and city carries a slug', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/cities/directory' });
    assert.equal(res.statusCode, 200);

    const body = res.json() as {
      areas: { area: string; areaName: string; slug: string; cities: { slug: string; lessonCount: number }[] }[];
    };
    assert.ok(body.areas.length > 0);
    for (const area of body.areas) {
      assert.ok(area.slug.length > 0);
      assert.ok(area.cities.length > 0);
      for (const city of area.cities) {
        assert.ok(city.slug.length > 0);
        assert.ok(city.lessonCount > 0);
      }
    }
  });

  test('GET /v1/cities/suggestions orders areas and cities by lesson supply, and each area total matches its own cities', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/cities/suggestions' });
    assert.equal(res.statusCode, 200);

    const body = res.json() as CitySuggestionsResponse;
    assert.ok(body.areas.length > 0);

    let previousAreaLessonCount: number | undefined;
    for (const area of body.areas) {
      if (previousAreaLessonCount !== undefined) {
        assert.ok(previousAreaLessonCount >= area.areaLessonCount, 'areas must appear in non-increasing areaLessonCount order');
      }
      previousAreaLessonCount = area.areaLessonCount;

      assert.ok(area.cities.length > 0);

      const summedLessonCount = area.cities.reduce((total, city) => total + city.lessonCount, 0);
      assert.equal(
        area.areaLessonCount,
        summedLessonCount,
        `${area.areaName}'s areaLessonCount must equal the sum of its own cities' lessonCount`,
      );

      let previousCityLessonCount: number | undefined;
      for (const city of area.cities) {
        if (previousCityLessonCount !== undefined) {
          assert.ok(
            previousCityLessonCount >= city.lessonCount,
            `cities within ${area.areaName} must appear in non-increasing lessonCount order`,
          );
        }
        previousCityLessonCount = city.lessonCount;
      }
    }
  });

  describe('GET /v1/cities/:slug', () => {
    test('resolves a seeded city by its slug, with its slug, its area slug, and the rabbis teaching there', async () => {
      const slug = toSlug(SEEDED_CITY_NAME);
      const res = await app.inject({ method: 'GET', url: `/v1/cities/${slug}` });
      assert.equal(res.statusCode, 200);

      const body = res.json() as {
        name: string;
        slug: string;
        areaName: string;
        areaSlug: string;
        rabbis: { id: string; name: string; slug: string; honorific: string }[];
      };
      assert.equal(body.name, SEEDED_CITY_NAME);
      assert.equal(body.slug, slug);
      assert.equal(typeof body.areaName, 'string');
      assert.ok(body.areaSlug.length > 0);

      const rabbi = body.rabbis.find((candidate) => candidate.id === SEEDED_CITY_RABBI_ID);
      assert.ok(rabbi);
      // A `Rabbi` embedded in another response (here, a city's rabbi list)
      // carries `slug` too, not only the standalone rabbi endpoints.
      assert.equal(rabbi.name, SEEDED_CITY_RABBI_NAME);
      assert.equal(rabbi.slug, toSlug(SEEDED_CITY_RABBI_NAME));
      assert.equal(rabbi.honorific, 'rav');
    });

    test('an unknown slug returns 404 with city_not_found', async () => {
      const res = await app.inject({ method: 'GET', url: '/v1/cities/עיר-שלא-קיימת-לעולם' });
      assert.equal(res.statusCode, 404);
      assert.equal((res.json() as { error: string }).error, 'city_not_found');
    });

    test('toSlug is idempotent on a real Hebrew city name, which is what lets a stale name-based URL normalise to the canonical slug', () => {
      const slug = toSlug(SEEDED_CITY_NAME);
      assert.equal(toSlug(slug), slug);
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
      assert.equal(rabbi.honorific, 'rav');

      const rabbanit = body.items.find((entry) => entry.id === SEEDED_RABBANIT_ID) as RabbiDirectoryEntry | undefined;
      assert.ok(rabbanit);
      assert.equal(rabbanit.name, SEEDED_RABBANIT_NAME);
      assert.equal(rabbanit.honorific, 'rabbanit');
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
      assert.equal(body.honorific, 'rav');
    });

    test('a genuinely missing rabbi returns 404', async () => {
      const res = await app.inject({ method: 'GET', url: '/v1/rabbis/does-not-exist' });
      assert.equal(res.statusCode, 404);
    });
  });

  // A pure function, exercised directly rather than through a write route:
  // both admin-rabbi and rabbi-profile pipe it through the shared
  // `rabbiNameSchema` before saving a name, so a pasted "הרב הרב ..." is
  // normalized to a bare stored name rather than ever being stored as is.
  // See `service/shared/name.ts`.
  describe('stripLeadingHonorific', () => {
    test('strips a leading rav honorific', () => {
      assert.equal(stripLeadingHonorific('הרב אברהם כהן'), 'אברהם כהן');
    });

    test('strips a leading rabbanit honorific', () => {
      assert.equal(stripLeadingHonorific('הרבנית שרה גולדברג'), 'שרה גולדברג');
    });

    test('is whitespace-tolerant between the honorific and the name', () => {
      assert.equal(stripLeadingHonorific('הרב   אברהם כהן'), 'אברהם כהן');
    });

    test('leaves an already-bare name untouched', () => {
      assert.equal(stripLeadingHonorific('אברהם כהן'), 'אברהם כהן');
    });

    test('strips every repeated leading honorific, not just the first', () => {
      assert.equal(stripLeadingHonorific('הרב הרב אברהם כהן'), 'אברהם כהן');
    });

    test('strips a bare honorific down to an empty string', () => {
      assert.equal(stripLeadingHonorific('הרב'), '');
      assert.equal(stripLeadingHonorific('הרבנית'), '');
    });
  });

  describe('rabbiNameSchema', () => {
    test('rejects a name that is only an honorific', () => {
      assert.equal(rabbiNameSchema.safeParse('הרב').success, false);
    });

    test('rejects a name that is only repeated honorifics', () => {
      assert.equal(rabbiNameSchema.safeParse('הרב הרבנית').success, false);
    });

    test('accepts a prefixed name and normalizes it to the bare name', () => {
      const result = rabbiNameSchema.safeParse('הרב משה');
      assert.equal(result.success, true);
      assert.equal(result.success && result.data, 'משה');
    });
  });
});
