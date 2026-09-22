import assert from 'node:assert/strict';
import { after, afterEach, before, describe, test } from 'node:test';

import type {
  CitySearchResult,
  CitySuggestionsResponse,
  HomeResponse,
  LessonOccurrence,
  LessonSearchResponse,
  Place,
  PlaceListResponse,
  PlaceSimilarResponse,
  RabbiDirectoryEntry,
  RabbiDirectoryResponse,
  RabbiProminence,
  WomenAreaResponse,
} from '@torabarabim/common';
import { eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { nanoid } from 'nanoid';

import { db } from '../src/db/client';
import { cities, lessonExceptions, lessons, places } from '../src/db/schema';
import { HOME_RABBI_ROW_CAP } from '../src/service/home/consts';
import { selectAreaPreview } from '../src/service/lesson/area-preview';
import { addDays, nextDateOnWeekday, todayInIsrael } from '../src/service/lesson/israel-time';
import type { ResolvedLessonOccurrence } from '../src/service/lesson/models';
import { rabbiNameSchema, stripLeadingHonorific } from '../src/service/shared/name';
import { PROMINENCE_RANK } from '../src/service/shared/rabbi-order';
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

// The wire `Rabbi` never carries `prominence`, so the ordering assertions
// read the seeded tiers from here, mirrored by hand from
// `server/src/db/seed/lessons.ts`. rabbi-9 is the rabbanit and never
// reaches the general home row. The database a developer runs the suite
// against also holds imported rabbis whose tier is not known here, so the
// assertions below check the seeded rabbis as a subsequence rather than
// demanding that every rabbi in the response appear in this table.
// Enough of the seeded rabbis to make the ordering assertion meaningful,
// and low enough to survive the row's cap filling up with imported rabbis.
const MIN_SEEDED_RABBIS_IN_ROW = 4;

const SEEDED_TIER_BY_RABBI_ID: Record<string, RabbiProminence> = {
  'rabbi-1': 'sought',
  'rabbi-2': 'local',
  'rabbi-3': 'known',
  'rabbi-4': 'local',
  'rabbi-5': 'known',
  'rabbi-6': 'sought',
  'rabbi-7': 'local',
  'rabbi-8': 'known',
  'rabbi-9': 'sought',
  'rabbi-10': 'local',
  'rabbi-11': 'known',
};

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
      assert.equal(typeof occurrence.venue.name, 'string');
      assert.equal(typeof occurrence.venue.city, 'string');
      // The lesson page's "other lessons in this city" link is built from
      // this slug, so it reaches the city page directly instead of falling
      // back to a text search the way it did before the field existed.
      assert.equal(occurrence.venue.citySlug, toSlug(occurrence.venue.city));
      assert.equal(typeof occurrence.venue.area, 'string');
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

    // Places arrive as a real entity (0016 reversed): a lesson may point at
    // one instead of carrying its own address text, and the public search
    // must resolve both arms to the exact same wire shape.
    describe('a place-backed venue', () => {
      const cleanupLessonIds = new Set<string>();
      const cleanupPlaceIds = new Set<string>();

      afterEach(async () => {
        for (const id of cleanupLessonIds) await db.delete(lessonExceptions).where(eq(lessonExceptions.lessonId, id));
        for (const id of cleanupLessonIds) await db.delete(lessons).where(eq(lessons.id, id));
        cleanupLessonIds.clear();
        for (const id of cleanupPlaceIds) await db.delete(places).where(eq(places.id, id));
        cleanupPlaceIds.clear();
      });

      const jerusalemCode = async (): Promise<number> => {
        const rows = await db.select({ code: cities.code }).from(cities).where(eq(cities.nameHe, SEEDED_CITY_NAME)).limit(1);
        const row = rows[0];
        if (!row) throw new Error('expected the seeded city to exist');
        return row.code;
      };

      const createPlace = async (cityCode: number, overrides: Partial<typeof places.$inferInsert> = {}): Promise<string> => {
        const id = `test-place-${nanoid(8)}`;
        await db.insert(places).values({ id, slug: id, name: `מקום בדיקה ${nanoid(8)}`, street: 'רחוב הבדיקה 1', cityCode, ...overrides });
        cleanupPlaceIds.add(id);
        return id;
      };

      // Every day of the week, so the occurrence is always in range no
      // matter what day the suite runs on.
      const createDailyLesson = async (placeId: string, cityCode: number): Promise<string> => {
        const id = `test-lesson-${nanoid(8)}`;
        await db.insert(lessons).values({
          id,
          rabbiId: SEEDED_RABBI_ID,
          placeId,
          cityCode,
          audience: 'men',
          recurrenceKind: 'weekly',
          recurrenceWeekdays: [0, 1, 2, 3, 4, 5, 6],
          startTime: '19:00',
          durationMinutes: 30,
        });
        cleanupLessonIds.add(id);
        return id;
      };

      const findItem = (body: LessonSearchResponse, lessonId: string) => body.items.find((item) => item.lessonId === lessonId);

      // Test 3: a place-backed lesson resolves to the place's own name and
      // street, and renaming the place changes what the occurrence reports.
      test("resolves venue.kind 'place' with the place row's name and street, and follows a rename", async () => {
        const cityCode = await jerusalemCode();
        const placeId = await createPlace(cityCode, { name: 'בית מדרש מקורי', street: 'רחוב מקורי 1' });
        const lessonId = await createDailyLesson(placeId, cityCode);

        const res = await app.inject({ method: 'GET', url: `/v1/lessons?rabbiId=${SEEDED_RABBI_ID}&${searchWindowQuery()}` });
        assert.equal(res.statusCode, 200);
        const item = findItem(res.json() as LessonSearchResponse, lessonId);
        assert.ok(item, 'expected the place-backed lesson to appear in the search');
        assert.ok(item.venue.kind === 'place', `expected venue.kind 'place', got '${item.venue.kind}'`);
        assert.equal(item.venue.placeId, placeId);
        assert.equal(item.venue.name, 'בית מדרש מקורי');
        assert.equal(item.venue.street, 'רחוב מקורי 1');

        await db.update(places).set({ name: 'בית מדרש חדש', street: 'רחוב חדש 2' }).where(eq(places.id, placeId));

        const afterRename = await app.inject({ method: 'GET', url: `/v1/lessons?rabbiId=${SEEDED_RABBI_ID}&${searchWindowQuery()}` });
        const renamedItem = findItem(afterRename.json() as LessonSearchResponse, lessonId);
        assert.ok(renamedItem);
        assert.equal(renamedItem.venue.name, 'בית מדרש חדש');
        assert.equal(renamedItem.venue.street, 'רחוב חדש 2');
      });

      // Test 4: every lesson in production today is address-only; a
      // place-arm join written as an inner join would drop all of them.
      test('an address-only lesson still appears unfiltered with venue.kind "address" and no place id', async () => {
        const res = await app.inject({ method: 'GET', url: `/v1/lessons?${searchWindowQuery()}` });
        assert.equal(res.statusCode, 200);
        const body = res.json() as LessonSearchResponse;
        const item = body.items.find((candidate) => candidate.lessonId === SUNDAY_TO_THURSDAY_LESSON_ID);
        assert.ok(item, 'expected the seeded address-only lesson to appear');
        assert.equal(item.venue.kind, 'address');
        assert.ok(!('placeId' in item.venue));
      });

      // Test 5: `placeId` narrows *after* an exception, so a cancelled
      // occurrence and one moved to a free address both drop out under
      // `?placeId=&status=scheduled`, while the unfiltered search still
      // reports the moved one at its new address.
      test('placeId narrows the resolved venue, after exceptions, and status narrows independently', async () => {
        const cityCode = await jerusalemCode();
        const placeId = await createPlace(cityCode);
        const lessonId = await createDailyLesson(placeId, cityCode);

        const from = todayInIsrael(new Date());
        const cancelledDate = addDays(from, 1);
        const movedDate = addDays(from, 2);

        await db.insert(lessonExceptions).values({ lessonId, date: cancelledDate, kind: 'cancelled', reason: 'בדיקה' });
        await db.insert(lessonExceptions).values({
          lessonId,
          date: movedDate,
          kind: 'modified',
          addressName: 'כתובת חלופית לבדיקה',
          addressStreet: 'רחוב חלופי 3',
          cityCode,
        });

        const filteredRes = await app.inject({
          method: 'GET',
          url: `/v1/lessons?placeId=${placeId}&status=scheduled&${searchWindowQuery()}`,
        });
        assert.equal(filteredRes.statusCode, 200);
        const filteredBody = filteredRes.json() as LessonSearchResponse;
        assert.ok(!filteredBody.items.some((item) => item.date === cancelledDate && item.lessonId === lessonId));
        assert.ok(!filteredBody.items.some((item) => item.date === movedDate && item.lessonId === lessonId));

        const unfilteredRes = await app.inject({ method: 'GET', url: `/v1/lessons?rabbiId=${SEEDED_RABBI_ID}&${searchWindowQuery()}` });
        const unfilteredBody = unfilteredRes.json() as LessonSearchResponse;
        const movedItem = unfilteredBody.items.find((item) => item.date === movedDate && item.lessonId === lessonId);
        assert.ok(movedItem, 'expected the unfiltered search to still report the moved occurrence');
        assert.equal(movedItem.venue.kind, 'address');
        assert.equal(movedItem.venue.name, 'כתובת חלופית לבדיקה');
      });

      // Test 6: deactivating a place removes it from every public place
      // surface, and a lesson still pointing at it degrades to an address,
      // never a dead link.
      test('a deactivated place disappears from every place surface, and its lessons resolve to an address with no id', async () => {
        const cityCode = await jerusalemCode();
        const placeId = await createPlace(cityCode, { name: 'מקום שיבוטל', street: 'רחוב הביטול 1' });
        const lessonId = await createDailyLesson(placeId, cityCode);

        await db.update(places).set({ isActive: false }).where(eq(places.id, placeId));

        const listRes = await app.inject({ method: 'GET', url: '/v1/places' });
        assert.equal(listRes.statusCode, 200);
        assert.ok(!(listRes.json() as PlaceListResponse).items.some((place: Place) => place.id === placeId));

        const detailRes = await app.inject({ method: 'GET', url: `/v1/places/${placeId}` });
        assert.equal(detailRes.statusCode, 404);

        const similarRes = await app.inject({ method: 'GET', url: `/v1/places/similar?cityCode=${cityCode}&name=${encodeURIComponent('מקום שיבוטל')}` });
        assert.equal(similarRes.statusCode, 200);
        assert.ok(!(similarRes.json() as PlaceSimilarResponse).items.some((place: Place) => place.id === placeId));

        const searchRes = await app.inject({ method: 'GET', url: `/v1/lessons?rabbiId=${SEEDED_RABBI_ID}&${searchWindowQuery()}` });
        const item = findItem(searchRes.json() as LessonSearchResponse, lessonId);
        assert.ok(item, 'expected the lesson to still appear, now as an address');
        assert.equal(item.venue.kind, 'address');
        assert.ok(!('placeId' in item.venue));
        assert.equal(item.venue.name, 'מקום שיבוטל');
        assert.equal(item.venue.street, 'רחוב הביטול 1');
      });

      // Test 7: the free-text search must find a place-backed lesson by its
      // place's own name, the same as it finds an address-only lesson by its
      // free text (the name-search exception's venue test above). A
      // place-backed lesson carries no address text of its own to match, so
      // this only passes if the search resolves the place's name to search
      // against.
      test('q matches a place-backed lesson by its place name', async () => {
        const cityCode = await jerusalemCode();
        const placeName = `היכל בדיקה ${nanoid(8)}`;
        const placeId = await createPlace(cityCode, { name: placeName });
        const lessonId = await createDailyLesson(placeId, cityCode);

        const res = await app.inject({
          method: 'GET',
          url: `/v1/lessons?q=${encodeURIComponent(placeName)}&${searchWindowQuery()}`,
        });
        assert.equal(res.statusCode, 200);
        const item = findItem(res.json() as LessonSearchResponse, lessonId);
        assert.ok(item, "expected q to match the lesson by its place's name");
      });
    });

    // The search page's heading names what narrowed the results, read off
    // this echo rather than off the first result: the case that matters
    // most is exactly when `items` comes back empty and there is nothing
    // else to read a name from.
    describe('applied filter echo', () => {
      const cleanupPlaceIds = new Set<string>();

      afterEach(async () => {
        for (const id of cleanupPlaceIds) await db.delete(places).where(eq(places.id, id));
        cleanupPlaceIds.clear();
      });

      const jerusalemCode = async (): Promise<number> => {
        const rows = await db.select({ code: cities.code }).from(cities).where(eq(cities.nameHe, SEEDED_CITY_NAME)).limit(1);
        const row = rows[0];
        if (!row) throw new Error('expected the seeded city to exist');
        return row.code;
      };

      test('a resolved rabbiId echoes the bare name and honorific, never the resolved place', async () => {
        const res = await app.inject({ method: 'GET', url: `/v1/lessons?rabbiId=${SEEDED_RABBI_ID}&${searchWindowQuery()}` });
        assert.equal(res.statusCode, 200);
        const body = res.json() as LessonSearchResponse;
        assert.deepEqual(body.appliedFilters.rabbi, { name: SEEDED_RABBI_NAME, honorific: 'rav' });
        assert.equal(body.appliedFilters.place, undefined);
      });

      test('an unresolvable rabbiId is a normal empty 200 with no name echoed', async () => {
        const res = await app.inject({ method: 'GET', url: `/v1/lessons?rabbiId=does-not-exist&${searchWindowQuery()}` });
        assert.equal(res.statusCode, 200);
        const body = res.json() as LessonSearchResponse;
        assert.deepEqual(body.items, []);
        assert.equal(body.appliedFilters.rabbi, undefined);
      });

      test('a resolved placeId echoes the place name, even once the place is deactivated', async () => {
        const cityCode = await jerusalemCode();
        const placeId = `test-place-${nanoid(8)}`;
        await db.insert(places).values({ id: placeId, slug: placeId, name: 'מקום בדיקה לתצוגה', street: 'רחוב הבדיקה 1', cityCode });
        cleanupPlaceIds.add(placeId);

        const res = await app.inject({ method: 'GET', url: `/v1/lessons?placeId=${placeId}&${searchWindowQuery()}` });
        assert.equal(res.statusCode, 200);
        assert.deepEqual((res.json() as LessonSearchResponse).appliedFilters.place, { name: 'מקום בדיקה לתצוגה' });

        await db.update(places).set({ isActive: false }).where(eq(places.id, placeId));

        const afterDeactivation = await app.inject({ method: 'GET', url: `/v1/lessons?placeId=${placeId}&${searchWindowQuery()}` });
        assert.equal(afterDeactivation.statusCode, 200);
        assert.deepEqual((afterDeactivation.json() as LessonSearchResponse).appliedFilters.place, { name: 'מקום בדיקה לתצוגה' });
      });

      test('an unresolvable placeId is a normal empty 200 with no place name echoed', async () => {
        const res = await app.inject({ method: 'GET', url: `/v1/lessons?placeId=does-not-exist&${searchWindowQuery()}` });
        assert.equal(res.statusCode, 200);
        const body = res.json() as LessonSearchResponse;
        assert.deepEqual(body.items, []);
        assert.equal(body.appliedFilters.place, undefined);
      });
    });
  });

  // `Place.lessonCount` and the directory's own ordering (server/src/service/
  // place/place.ts): both are new business rules with nothing else in the
  // suite guarding them.
  describe('GET /v1/places', () => {
    const cleanupLessonIds = new Set<string>();
    const cleanupPlaceIds = new Set<string>();

    afterEach(async () => {
      for (const id of cleanupLessonIds) await db.delete(lessonExceptions).where(eq(lessonExceptions.lessonId, id));
      for (const id of cleanupLessonIds) await db.delete(lessons).where(eq(lessons.id, id));
      cleanupLessonIds.clear();
      for (const id of cleanupPlaceIds) await db.delete(places).where(eq(places.id, id));
      cleanupPlaceIds.clear();
    });

    const cityCodeByName = async (name: string): Promise<number> => {
      const rows = await db.select({ code: cities.code }).from(cities).where(eq(cities.nameHe, name)).limit(1);
      const row = rows[0];
      if (!row) throw new Error(`expected the seeded city '${name}' to exist`);
      return row.code;
    };

    const createPlace = async (cityCode: number, overrides: Partial<typeof places.$inferInsert> = {}): Promise<string> => {
      const id = `test-place-${nanoid(8)}`;
      await db.insert(places).values({ id, slug: id, name: `מקום בדיקה ${nanoid(8)}`, street: 'רחוב הבדיקה 1', cityCode, ...overrides });
      cleanupPlaceIds.add(id);
      return id;
    };

    // Every day of the week, so the occurrence is always in range no matter
    // what day the suite runs on; mirrors `createDailyLesson` above. `rav`
    // gets a men's lesson and `rabbanit` a women's one, matching what 0026
    // actually allows each of them to teach.
    const createLesson = async (rabbiId: string, placeId: string, cityCode: number): Promise<string> => {
      const id = `test-lesson-${nanoid(8)}`;
      await db.insert(lessons).values({
        id,
        rabbiId,
        placeId,
        cityCode,
        audience: rabbiId === SEEDED_RABBANIT_ID ? 'women' : 'men',
        recurrenceKind: 'weekly',
        recurrenceWeekdays: [0, 1, 2, 3, 4, 5, 6],
        startTime: '19:00',
        durationMinutes: 30,
      });
      cleanupLessonIds.add(id);
      return id;
    };

    // This is the rule that keeps the directory's number and the place
    // page's own occurrence list (built with `scope: 'general'`) agreeing:
    // if this ever counted every lesson at the venue, the directory would
    // say 2 while the place's own page kept showing 1.
    test("a rabbanit's lesson at a place does not inflate that place's lessonCount", async () => {
      const cityCode = await cityCodeByName(SEEDED_CITY_NAME);
      const placeId = await createPlace(cityCode);
      await createLesson(SEEDED_RABBI_ID, placeId, cityCode);
      await createLesson(SEEDED_RABBANIT_ID, placeId, cityCode);

      const res = await app.inject({ method: 'GET', url: '/v1/places' });
      assert.equal(res.statusCode, 200);
      const place = (res.json() as PlaceListResponse).items.find((item) => item.id === placeId);
      assert.ok(place, 'expected the seeded place to appear');
      assert.equal(place.lessonCount, 1, "expected only the rav's lesson to count, not the rabbanit's");
    });

    // Ordering rule: has-lessons first, then city (Hebrew collation), then
    // name, then id. `SEEDED_CITY_NAME` ('ירושלים') sorts before
    // `SEEDED_RABBANIT_CITY_NAME` ('רעננה') in Hebrew collation, so a naive
    // city-then-lesson ordering would put the lesson-less Jerusalem place
    // first; the has-lessons tier must win regardless.
    test('a place with a lesson sorts before one with none, even when the empty place sits in an earlier-sorting city', async () => {
      const emptyPlaceCityCode = await cityCodeByName(SEEDED_CITY_NAME);
      const lessonPlaceCityCode = await cityCodeByName(SEEDED_RABBANIT_CITY_NAME);

      const emptyPlaceId = await createPlace(emptyPlaceCityCode, { name: 'א מקום ללא שיעורים' });
      const lessonPlaceId = await createPlace(lessonPlaceCityCode, { name: 'ת מקום עם שיעור' });
      await createLesson(SEEDED_RABBI_ID, lessonPlaceId, lessonPlaceCityCode);

      const res = await app.inject({ method: 'GET', url: '/v1/places' });
      assert.equal(res.statusCode, 200);
      const items = (res.json() as PlaceListResponse).items;

      const emptyIndex = items.findIndex((item) => item.id === emptyPlaceId);
      const lessonIndex = items.findIndex((item) => item.id === lessonPlaceId);
      assert.ok(emptyIndex !== -1 && lessonIndex !== -1, 'expected both seeded places to appear');
      assert.ok(lessonIndex < emptyIndex, 'a place with a lesson must sort before one with none, regardless of city');
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

  // Test 7 (updates the existing shape test to the new tile placement):
  // every row is still correctly shaped, no lesson item is taught by a
  // rabbanit, every row keeps at least 3 lesson items after the scope
  // filter, and the tile's count matches `GET /v1/women`'s own count.
  // Placement: exactly one row carries `womensAreaTileIndex` (value 3) when
  // the women's set is non-empty, none when it is empty; the row is the
  // second row when it has at least four lessons, otherwise the next row
  // that does (see `WOMENS_AREA_TILE_*` in `service/home/consts.ts`).
  test("GET /v1/home returns every row correctly shaped, excludes rabbanit-taught lessons, and places at most one women's-area tile", async () => {
    const [homeRes, womenRes] = await Promise.all([
      app.inject({ method: 'GET', url: '/v1/home' }),
      app.inject({ method: 'GET', url: '/v1/women' }),
    ]);
    assert.equal(homeRes.statusCode, 200);
    assert.equal(womenRes.statusCode, 200);

    const body = homeRes.json() as HomeResponse;
    assert.ok(Array.isArray(body.rows));

    const rowsWithTile: number[] = [];
    body.rows.forEach((row, rowIndex) => {
      assert.equal(typeof row.id, 'string');
      assert.equal(typeof row.title, 'string');
      assert.ok(Array.isArray(row.items));
      assert.ok(row.items.length >= 3, `expected row ${row.id} to keep at least 3 lesson items after the scope filter`);
      assert.ok(
        row.items.every((item) => typeof item.lessonId === 'string'),
        `expected every item in row ${row.id} to be a lesson, nothing else`,
      );
      assert.ok(!row.items.some((item) => item.rabbi.honorific === 'rabbanit'));

      if (row.womensAreaTileIndex !== undefined) {
        rowsWithTile.push(rowIndex);
        assert.equal(row.womensAreaTileIndex, 3);
        assert.ok(row.items.length >= 4, `expected row ${row.id} to have at least 4 lessons to carry the tile`);
      }
    });

    const womenBody = womenRes.json() as WomenAreaResponse;
    const womenLessonCount = womenBody.kind === 'populated' ? womenBody.lessonCount : 0;
    assert.equal(body.womensAreaLessonCount, womenLessonCount);

    if (body.womensAreaLessonCount === 0) {
      assert.equal(rowsWithTile.length, 0, "expected no row to carry the tile when the women's set is empty");
    } else {
      // The candidate row is the second row (index 1); if it has fewer
      // than four lessons, the tile moves to the next row that does.
      const expectedRowIndex = body.rows.findIndex((row, index) => index >= 1 && row.items.length >= 4);
      if (expectedRowIndex === -1) {
        assert.equal(rowsWithTile.length, 0, 'no row has enough lessons to carry the tile');
      } else {
        assert.deepEqual(rowsWithTile, [expectedRowIndex]);
      }
    }
  });

  // The "לפי רב" avatar row: sorted by tier (sought before known before
  // local), capped at 16, and never carrying a rabbanit (0026: she stays
  // off the general home surfaces).
  test('GET /v1/home returns a rabbi list sorted by tier, capped at 16, with no rabbanit in it', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/home' });
    assert.equal(res.statusCode, 200);

    const body = res.json() as HomeResponse;
    assert.ok(Array.isArray(body.rabbis));
    assert.ok(body.rabbis.length > 0);
    assert.ok(body.rabbis.length <= HOME_RABBI_ROW_CAP, 'the avatar row must never exceed its cap');
    assert.ok(!body.rabbis.some((rabbi) => rabbi.honorific === 'rabbanit'));

    let previousRank = -1;
    let checkedCount = 0;
    for (const rabbi of body.rabbis) {
      const tier = SEEDED_TIER_BY_RABBI_ID[rabbi.id];
      if (!tier) continue;
      const rank = PROMINENCE_RANK[tier];
      assert.ok(rank >= previousRank, `expected ${rabbi.id} (tier ${tier}) not to sort before an already-seen, higher tier`);
      previousRank = rank;
      checkedCount += 1;
    }
    // Without this the loop above would assert nothing at all the moment
    // the seed ids change, and pass in silence.
    assert.ok(checkedCount >= MIN_SEEDED_RABBIS_IN_ROW, `expected at least ${MIN_SEEDED_RABBIS_IN_ROW} seeded rabbis in the row, saw ${checkedCount}`);
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

    // An exact name match outranks every other tier (population, then name)
    // and never depends on the lesson count, so this holds whichever way the
    // count is gathered.
    test('an exact name match is ordered first', async () => {
      const res = await app.inject({ method: 'GET', url: `/v1/cities?q=${encodeURIComponent(SEEDED_CITY_NAME)}` });
      assert.equal(res.statusCode, 200);
      const { items } = res.json() as { items: CitySearchResult[] };
      assert.ok(items.length > 0);
      assert.equal(items[0]?.name, SEEDED_CITY_NAME);
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

    // Ordering rule 1: prominence tier, sought first. rabbi-1 and rabbi-6
    // are seeded 'sought'; rabbi-2, 'local', must never sort before them.
    test('returns the sought-after rabbis first', async () => {
      const res = await app.inject({ method: 'GET', url: '/v1/rabbis?pageSize=50' });
      assert.equal(res.statusCode, 200);
      const body = res.json() as RabbiDirectoryResponse;

      const indexOf = (id: string): number => body.items.findIndex((item) => item.id === id);
      const soughtIndex = indexOf('rabbi-1');
      const otherSoughtIndex = indexOf('rabbi-6');
      const localIndex = indexOf('rabbi-2');
      assert.ok(soughtIndex !== -1 && otherSoughtIndex !== -1 && localIndex !== -1);
      assert.ok(soughtIndex < localIndex, 'a sought rabbi must sort before a local one');
      assert.ok(otherSoughtIndex < localIndex, 'a sought rabbi must sort before a local one');
    });

    // Pagination is stable: two pages fetched separately never overlap, and
    // concatenating them equals the prefix of one larger page, which is
    // exactly what the client relies on when it fetches `/rabbis` page by
    // page and concatenates the results itself.
    test('pagination is stable: two pageSize=5 pages never duplicate an id, and concatenate to the pageSize=50 prefix', async () => {
      const [page1Res, page2Res, allRes] = await Promise.all([
        app.inject({ method: 'GET', url: '/v1/rabbis?page=1&pageSize=5' }),
        app.inject({ method: 'GET', url: '/v1/rabbis?page=2&pageSize=5' }),
        app.inject({ method: 'GET', url: '/v1/rabbis?pageSize=50' }),
      ]);
      assert.equal(page1Res.statusCode, 200);
      assert.equal(page2Res.statusCode, 200);
      assert.equal(allRes.statusCode, 200);

      const page1Ids = (page1Res.json() as RabbiDirectoryResponse).items.map((item) => item.id);
      const page2Ids = (page2Res.json() as RabbiDirectoryResponse).items.map((item) => item.id);
      const allIds = (allRes.json() as RabbiDirectoryResponse).items.map((item) => item.id);

      const combinedIds = [...page1Ids, ...page2Ids];
      assert.equal(new Set(combinedIds).size, combinedIds.length, 'no id must appear in both pages');
      assert.deepEqual(combinedIds, allIds.slice(0, combinedIds.length));
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
  // the lesson page's area preview relies on it to never link to the page
  // it is already on, and to never render one lesson two or three times in
  // a thin area. See `service/lesson/area-preview.ts`.
  describe('selectAreaPreview', () => {
    const buildOccurrence = (lessonId: string, date: string): ResolvedLessonOccurrence => ({
      lessonId,
      date,
      startTime: '20:00',
      endTime: '21:00',
      status: 'scheduled',
      audience: 'men',
      rabbi: { id: `rabbi-of-${lessonId}`, name: 'שם הרב', honorific: 'rav', slug: `slug-${lessonId}` },
      venue: { kind: 'address', name: 'בית מדרש', street: 'רחוב הרצל', city: 'עיר', citySlug: 'ir', area: 'center' },
    });

    test('excludes every occurrence of the excluded lesson', () => {
      const items = [buildOccurrence('lesson-a', '2026-01-01'), buildOccurrence('lesson-b', '2026-01-02')];
      const result = selectAreaPreview(items, 'lesson-a', 10);
      assert.ok(!result.some((item) => item.lessonId === 'lesson-a'));
      assert.equal(result.length, 1);
    });

    // A 7-day search window can hold several occurrences of one
    // weekly-or-daily lesson; without de-duplication a thin area would
    // render the same lesson two or three times.
    test('keeps only the first occurrence of a repeated lesson', () => {
      const items = [
        buildOccurrence('lesson-b', '2026-01-02'),
        buildOccurrence('lesson-b', '2026-01-09'),
        buildOccurrence('lesson-c', '2026-01-03'),
      ];
      const result = selectAreaPreview(items, 'lesson-a', 10);
      assert.equal(result.filter((item) => item.lessonId === 'lesson-b').length, 1);
      assert.equal(result.find((item) => item.lessonId === 'lesson-b')?.date, '2026-01-02');
    });

    test('preserves the incoming order', () => {
      const items = [buildOccurrence('lesson-c', '2026-01-03'), buildOccurrence('lesson-b', '2026-01-02')];
      const result = selectAreaPreview(items, 'lesson-a', 10);
      assert.deepEqual(result.map((item) => item.lessonId), ['lesson-c', 'lesson-b']);
    });

    test('caps at the limit', () => {
      const items = [
        buildOccurrence('lesson-a', '2026-01-01'),
        buildOccurrence('lesson-b', '2026-01-02'),
        buildOccurrence('lesson-c', '2026-01-03'),
      ];
      const result = selectAreaPreview(items, 'lesson-x', 2);
      assert.equal(result.length, 2);
    });

    test('returns [] when nothing qualifies', () => {
      const items = [buildOccurrence('lesson-a', '2026-01-01')];
      assert.deepEqual(selectAreaPreview(items, 'lesson-a', 10), []);
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
