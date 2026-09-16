import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';

import type {
  CitySearchResult,
  CitySuggestionsResponse,
  HomeResponse,
  HomeRowItem,
  LessonOccurrence,
  LessonSearchResponse,
  RabbiDirectoryEntry,
  RabbiDirectoryResponse,
  WomenAreaResponse,
} from '@torabarabim/common';
import type { FastifyInstance } from 'fastify';

import { addDays, nextDateOnWeekday, todayInIsrael } from '../src/service/lesson/israel-time';
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
const SEEDED_RABBANIT_SURNAME = 'גולדברג';
const SEEDED_RABBANIT_CITY_NAME = 'רעננה';
const SEEDED_RABBANIT_VENUE_TEXT = 'בית יעל';
// The rav's women-only lesson seeded for the women's area; see
// `server/src/db/seed/lessons.ts`.
const SEEDED_WOMEN_LESSON_ID = 'lesson-27';

// A 14-day window, wide enough that a weekly lesson's next occurrence is
// always inside it no matter what day the suite happens to run on, and
// explicit rather than relying on the search's own 7-day default.
const searchWindowQuery = (): string => {
  const from = todayInIsrael(new Date());
  const to = addDays(from, 13);
  return `from=${from}&to=${to}&pageSize=50`;
};

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

    // Test 1: default search (general scope) excludes a rabbanit's lessons
    // and keeps a rav's women-only lesson (0026 restricts who may teach a
    // women-only lesson, not whether one may exist on a general surface).
    test('the default scope excludes a rabbanit-taught lesson and keeps a rav-taught women-only lesson', async () => {
      const res = await app.inject({ method: 'GET', url: `/v1/lessons?${searchWindowQuery()}` });
      assert.equal(res.statusCode, 200);
      const body = res.json() as LessonSearchResponse;
      assert.ok(!body.items.some((item) => item.rabbi.id === SEEDED_RABBANIT_ID));
      assert.ok(body.items.some((item) => item.lessonId === SEEDED_WOMEN_LESSON_ID));
    });

    // Test 2: `audience=women` is never a valid public filter; `audience=men`
    // narrows to men-or-mixed and still carries none of the rabbanit's.
    test('rejects audience=women, and audience=men returns only men-or-mixed lessons', async () => {
      const rejected = await app.inject({ method: 'GET', url: '/v1/lessons?audience=women' });
      assert.equal(rejected.statusCode, 400);

      const res = await app.inject({ method: 'GET', url: `/v1/lessons?audience=men&${searchWindowQuery()}` });
      assert.equal(res.statusCode, 200);
      const body = res.json() as LessonSearchResponse;
      assert.ok(body.items.length > 0);
      assert.ok(body.items.every((item) => item.audience === 'men' || item.audience === 'mixed'));
      assert.ok(!body.items.some((item) => item.rabbi.id === SEEDED_RABBANIT_ID));
    });

    // Test 3: the name-search exception (owner decision 5) shows her
    // lessons, with her photo, only when her own name matched `q` and no
    // audience filter narrowed the request. Her venue's name is not her
    // name, and an audience filter wins over the exception.
    describe('the name-search exception', () => {
      test("her surname returns her lessons", async () => {
        const res = await app.inject({
          method: 'GET',
          url: `/v1/lessons?q=${encodeURIComponent(SEEDED_RABBANIT_SURNAME)}&${searchWindowQuery()}`,
        });
        assert.equal(res.statusCode, 200);
        const body = res.json() as LessonSearchResponse;
        assert.ok(body.items.some((item) => item.rabbi.id === SEEDED_RABBANIT_ID));
      });

      test('the same query plus audience=men returns none of hers: the filter wins', async () => {
        const res = await app.inject({
          method: 'GET',
          url: `/v1/lessons?q=${encodeURIComponent(SEEDED_RABBANIT_SURNAME)}&audience=men&${searchWindowQuery()}`,
        });
        assert.equal(res.statusCode, 200);
        const body = res.json() as LessonSearchResponse;
        assert.ok(!body.items.some((item) => item.rabbi.id === SEEDED_RABBANIT_ID));
      });

      test("her venue's name, not her own name, returns none of hers", async () => {
        const res = await app.inject({
          method: 'GET',
          url: `/v1/lessons?q=${encodeURIComponent(SEEDED_RABBANIT_VENUE_TEXT)}&${searchWindowQuery()}`,
        });
        assert.equal(res.statusCode, 200);
        const body = res.json() as LessonSearchResponse;
        assert.ok(!body.items.some((item) => item.rabbi.id === SEEDED_RABBANIT_ID));
      });
    });

    // Test 4: `scope=women` includes every teacher, audience women or mixed
    // only, and combines with every other filter as AND.
    describe('scope=women', () => {
      test('every item is audience women or mixed, and includes both hers and a mixed lesson taught by a rav', async () => {
        const res = await app.inject({ method: 'GET', url: `/v1/lessons?scope=women&${searchWindowQuery()}` });
        assert.equal(res.statusCode, 200);
        const body = res.json() as LessonSearchResponse;
        assert.ok(body.items.length > 0);
        assert.ok(body.items.every((item) => item.audience === 'women' || item.audience === 'mixed'));
        assert.ok(body.items.some((item) => item.rabbi.id === SEEDED_RABBANIT_ID));
        // A wrong "women's set" definition (e.g. audience women only, no
        // mixed) would still pass the two assertions above; this one only
        // passes if a rav's women-only lesson is included too.
        assert.ok(body.items.some((item) => item.lessonId === SEEDED_WOMEN_LESSON_ID));
        assert.ok(body.items.some((item) => item.audience === 'mixed' && item.rabbi.honorific === 'rav'));
      });

      test('rabbiId scoped to the rabbanit returns her lessons only with scope=women', async () => {
        const withScope = await app.inject({
          method: 'GET',
          url: `/v1/lessons?rabbiId=${SEEDED_RABBANIT_ID}&scope=women&${searchWindowQuery()}`,
        });
        assert.equal(withScope.statusCode, 200);
        assert.ok((withScope.json() as LessonSearchResponse).items.length > 0);

        const withoutScope = await app.inject({
          method: 'GET',
          url: `/v1/lessons?rabbiId=${SEEDED_RABBANIT_ID}&${searchWindowQuery()}`,
        });
        assert.equal(withoutScope.statusCode, 200);
        assert.deepEqual((withoutScope.json() as LessonSearchResponse).items, []);
      });
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

  // Test 7 (updates the existing shape test to the row-item union): every
  // row is still correctly shaped, no lesson item is taught by a rabbanit,
  // exactly one women's-area tile exists and it sits at index 1 of the
  // first row, every row keeps at least 3 lesson items after the scope
  // filter, and the tile's count matches `GET /v1/women`'s own count.
  test("GET /v1/home returns every row correctly shaped, excludes rabbanit-taught lessons, and places exactly one women's-area tile", async () => {
    const [homeRes, womenRes] = await Promise.all([
      app.inject({ method: 'GET', url: '/v1/home' }),
      app.inject({ method: 'GET', url: '/v1/women' }),
    ]);
    assert.equal(homeRes.statusCode, 200);
    assert.equal(womenRes.statusCode, 200);

    const body = homeRes.json() as HomeResponse;
    assert.ok(Array.isArray(body.rows));

    let tileCount = 0;
    body.rows.forEach((row, rowIndex) => {
      assert.equal(typeof row.id, 'string');
      assert.equal(typeof row.title, 'string');
      assert.ok(Array.isArray(row.items));

      const lessonItems = row.items.filter(
        (item): item is Extract<HomeRowItem, { kind: 'lesson' }> => item.kind === 'lesson',
      );
      assert.ok(lessonItems.length >= 3, `expected row ${row.id} to keep at least 3 lesson items after the scope filter`);
      assert.ok(!lessonItems.some((item) => item.lesson.rabbi.honorific === 'rabbanit'));

      row.items.forEach((item, itemIndex) => {
        if (item.kind !== 'womensArea') return;
        tileCount += 1;
        assert.equal(rowIndex, 0, 'the tile must appear in the first row only');
        assert.equal(itemIndex, 1, 'the tile must sit at index 1 of the first row');
      });
    });

    const womenBody = womenRes.json() as WomenAreaResponse;
    const womenLessonCount = womenBody.kind === 'populated' ? womenBody.lessonCount : 0;
    assert.equal(body.womensAreaLessonCount, womenLessonCount);
    assert.equal(tileCount, body.womensAreaLessonCount > 0 ? 1 : 0);
  });

  // Test 8: a populated summary lists both a rabbanit and a rav among the
  // teachers (the women's set is defined by audience, not by teacher), and
  // at least one city.
  describe('GET /v1/women', () => {
    test('returns a populated summary with a rabbanit and a rav among the teachers, and at least one city', async () => {
      const res = await app.inject({ method: 'GET', url: '/v1/women' });
      assert.equal(res.statusCode, 200);

      const body = res.json() as WomenAreaResponse;
      assert.equal(body.kind, 'populated');
      if (body.kind !== 'populated') return;

      assert.ok(body.lessonCount > 0);
      assert.ok(body.teachers.some((teacher) => teacher.id === SEEDED_RABBANIT_ID));
      assert.ok(body.teachers.some((teacher) => teacher.honorific === 'rav'));
      assert.ok(body.cities.length > 0);
      assert.ok(body.cities.every((city) => city.lessonCount > 0));
      // Each city's count is the same women's-set definition, split by
      // city: they must sum to the summary's own count.
      const citiesLessonCount = body.cities.reduce((total, city) => total + city.lessonCount, 0);
      assert.equal(citiesLessonCount, body.lessonCount);
    });
  });

  describe('GET /v1/cities', () => {
    test('an absent query is a normal 200 with an empty list, never a 404', async () => {
      const res = await app.inject({ method: 'GET', url: '/v1/cities' });
      assert.equal(res.statusCode, 200);
      assert.deepEqual((res.json() as { items: CitySearchResult[] }).items, []);
    });

    test('matches a known seeded city by prefix, and carries its area name and lesson count', async () => {
      const [searchRes, directoryRes] = await Promise.all([
        app.inject({ method: 'GET', url: `/v1/cities?q=${encodeURIComponent(SEEDED_CITY_PREFIX)}` }),
        app.inject({ method: 'GET', url: '/v1/cities/directory' }),
      ]);
      assert.equal(searchRes.statusCode, 200);
      assert.equal(directoryRes.statusCode, 200);

      const { items } = searchRes.json() as { items: CitySearchResult[] };
      const city = items.find((candidate) => candidate.name === SEEDED_CITY_NAME);
      assert.ok(city);
      assert.equal(typeof city.areaName, 'string');
      assert.ok(city.areaName.length > 0);
      assert.equal(typeof city.lessonCount, 'number');
      assert.ok(city.lessonCount > 0, 'the seeded city has seeded lessons');

      // `search` and `listDirectory` share one SQL aggregation
      // (`citiesWithLessonCountQuery`); a real, non-zero count here means a
      // mismatch between the two call sites would show up as a genuine
      // number disagreement, not two zeros agreeing by accident.
      const directoryBody = directoryRes.json() as {
        areas: { cities: { slug: string; lessonCount: number }[] }[];
      };
      const directoryCity = directoryBody.areas.flatMap((area) => area.cities).find((candidate) => candidate.slug === toSlug(SEEDED_CITY_NAME));
      assert.ok(directoryCity);
      assert.equal(city.lessonCount, directoryCity.lessonCount);
    });

    test('rejects a query over the length limit', async () => {
      const res = await app.inject({ method: 'GET', url: `/v1/cities?q=${'א'.repeat(101)}` });
      assert.equal(res.statusCode, 400);
    });

    // A general surface (the header search), so it counts general-scope
    // lessons only: the rabbanit's city has real lessons but none of them
    // general, so its count here must be 0, not the raw lesson count.
    test("a general surface counts general-scope lessons only: the rabbanit's city, whose only lessons are hers, shows lessonCount 0", async () => {
      const res = await app.inject({ method: 'GET', url: `/v1/cities?q=${encodeURIComponent(SEEDED_RABBANIT_CITY_NAME)}` });
      assert.equal(res.statusCode, 200);
      const { items } = res.json() as { items: CitySearchResult[] };
      const city = items.find((candidate) => candidate.name === SEEDED_RABBANIT_CITY_NAME);
      assert.ok(city, 'the city itself must still match the prefix, even with no general-scope lesson');
      assert.equal(city.lessonCount, 0);
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
        // A general surface, so a city whose only lessons are the
        // rabbanit's (real lessons, zero general-scope ones) must not
        // appear here at all, not merely with a count of 0.
        assert.notEqual(city.slug, toSlug(SEEDED_RABBANIT_CITY_NAME));
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
      assert.ok(!area.cities.some((city) => city.slug === toSlug(SEEDED_RABBANIT_CITY_NAME)));

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

    // Test 5: the rail excludes a rabbanit even in her own city (0026: her
    // lessons are for women only, and the rail has no search text for the
    // name exception to apply to).
    test("the city rail for the rabbanit's own city leaves her out", async () => {
      const slug = toSlug(SEEDED_RABBANIT_CITY_NAME);
      const res = await app.inject({ method: 'GET', url: `/v1/cities/${slug}` });
      assert.equal(res.statusCode, 200);
      const body = res.json() as { rabbis: { id: string }[] };
      assert.ok(!body.rabbis.some((rabbi) => rabbi.id === SEEDED_RABBANIT_ID));
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
      assert.ok(body.total >= 10, 'expected at least the 10 seeded ravs (the default scope excludes the rabbanit)');

      const rabbi = body.items.find((entry) => entry.id === SEEDED_RABBI_ID) as RabbiDirectoryEntry | undefined;
      assert.ok(rabbi);
      assert.ok(rabbi.lessonCount > 0);
      assert.ok(rabbi.cities.length > 0);
      assert.equal(typeof rabbi.slug, 'string');
      assert.ok(rabbi.slug.length > 0);
      assert.equal(rabbi.slug, toSlug(SEEDED_RABBI_NAME));
      assert.equal(rabbi.honorific, 'rav');
    });

    test('rejects a non-numeric page size', async () => {
      const res = await app.inject({ method: 'GET', url: '/v1/rabbis?pageSize=abc' });
      assert.equal(res.statusCode, 400);
    });

    // Test 6: the default (general) scope lists ravs only; scope=women
    // lists rabbaniyot only, including the seeded one.
    test('the default scope has no rabbanit, and scope=women returns only rabbaniyot including the seeded one', async () => {
      const general = await app.inject({ method: 'GET', url: '/v1/rabbis?pageSize=50' });
      assert.equal(general.statusCode, 200);
      const generalBody = general.json() as RabbiDirectoryResponse;
      assert.ok(!generalBody.items.some((item) => item.honorific === 'rabbanit'));

      const women = await app.inject({ method: 'GET', url: '/v1/rabbis?scope=women&pageSize=50' });
      assert.equal(women.statusCode, 200);
      const womenBody = women.json() as RabbiDirectoryResponse;
      assert.ok(womenBody.items.length > 0);
      assert.ok(womenBody.items.every((item) => item.honorific === 'rabbanit'));
      const rabbanit = womenBody.items.find((item) => item.id === SEEDED_RABBANIT_ID);
      assert.ok(rabbanit);
      assert.equal(rabbanit.name, SEEDED_RABBANIT_NAME);
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
