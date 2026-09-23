import assert from 'node:assert/strict';
import { after, afterEach, before, describe, test } from 'node:test';

import type { AdminDedication, AdminOccurrenceListResponse, AdminPlaceResponse, CreateDedicationRequest, DedicationType, HomeResponse } from '@torabarabim/common';
import { eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { nanoid } from 'nanoid';

import { db } from '../src/db/client';
import { adminUsers, cities, dedications, lessonExceptions, lessons, places, rabbis } from '../src/db/schema';
import { addDays, todayInIsrael } from '../src/service/lesson/israel-time';
import { addMinutes } from '../src/service/lesson/occurrence';
import { SESSION_COOKIE_NAME } from '../src/service/admin-auth/consts';
import * as adminUserService from '../src/service/admin-user/admin-user';
import { assertDatabaseReachable, buildAdminTestApp, rawClient } from './app-harness';

const SEEDED_CITY_NAME = 'ירושלים';

const uniqueSuffix = (): string => nanoid(8);

describe('admin API', () => {
  let app: FastifyInstance;
  const cleanupLessonIds = new Set<string>();
  const cleanupRabbiIds = new Set<string>();
  const cleanupAdminUserIds = new Set<string>();
  const cleanupPlaceIds = new Set<string>();

  before(async () => {
    await assertDatabaseReachable();
    app = await buildAdminTestApp();
  });

  afterEach(async () => {
    for (const id of cleanupLessonIds) await db.delete(lessonExceptions).where(eq(lessonExceptions.lessonId, id));
    for (const id of cleanupLessonIds) await db.delete(lessons).where(eq(lessons.id, id));
    cleanupLessonIds.clear();
    for (const id of cleanupRabbiIds) await db.delete(rabbis).where(eq(rabbis.id, id));
    cleanupRabbiIds.clear();
    for (const id of cleanupAdminUserIds) await db.delete(adminUsers).where(eq(adminUsers.id, id));
    cleanupAdminUserIds.clear();
    for (const id of cleanupPlaceIds) await db.delete(places).where(eq(places.id, id));
    cleanupPlaceIds.clear();
  });

  // `rawClient.end()` happens once, in the file-level `after` at the
  // bottom: this describe and the dedications describe below each build
  // their own app against the one shared connection, and ending it here
  // would break the block that runs next in the same file.
  after(async () => {
    await app.close();
  });

  // Logs in through the real route, exactly as agent-import.test.ts's
  // `loginAsNewAdmin` does: the guard under test is `requireAdminAuth`
  // itself, not a bypass of it.
  const loginAsNewAdmin = async (): Promise<string> => {
    const email = `test-admin-${uniqueSuffix()}@example.com`;
    const password = 'Test-Password-123!';
    const record = await adminUserService.create({ name: 'מנהל בדיקה', email, username: `admin-${uniqueSuffix()}`, password });
    cleanupAdminUserIds.add(record.id);

    const res = await app.inject({ method: 'POST', url: '/v1/admin/login', payload: { identifier: email, password } });
    assert.equal(res.statusCode, 200);
    const cookie = res.cookies.find((c) => c.name === SESSION_COOKIE_NAME);
    if (!cookie) throw new Error('expected the admin login route to set a session cookie');
    return `${cookie.name}=${cookie.value}`;
  };

  const createRabbi = async (): Promise<string> => {
    const id = `test-rabbi-${uniqueSuffix()}`;
    await db.insert(rabbis).values({ id, name: `רב בדיקה ${uniqueSuffix()}`, honorific: 'rav' });
    cleanupRabbiIds.add(id);
    return id;
  };

  const jerusalemCode = async (): Promise<number> => {
    const rows = await db.select({ code: cities.code }).from(cities).where(eq(cities.nameHe, SEEDED_CITY_NAME)).limit(1);
    const row = rows[0];
    if (!row) throw new Error('expected the seeded city to exist');
    return row.code;
  };

  // Every weekday, so the occurrence window (14 days, counting today) is
  // filled solidly: exactly one occurrence per day, with a fully
  // predictable count and date span to assert against.
  const seedDailyLesson = async (): Promise<{ lessonId: string; rabbiId: string; cityCode: number; startTime: string; durationMinutes: number }> => {
    const rabbiId = await createRabbi();
    const cityCode = await jerusalemCode();
    const lessonId = `test-lesson-${uniqueSuffix()}`;
    const startTime = '19:00';
    const durationMinutes = 60;
    await db.insert(lessons).values({
      id: lessonId,
      rabbiId,
      addressName: 'בית כנסת הבדיקה',
      addressStreet: 'רחוב הבדיקה 1',
      cityCode,
      audience: 'men',
      recurrenceKind: 'weekly',
      recurrenceWeekdays: [0, 1, 2, 3, 4, 5, 6],
      startTime,
      durationMinutes,
    });
    cleanupLessonIds.add(lessonId);
    return { lessonId, rabbiId, cityCode, startTime, durationMinutes };
  };

  const createPlace = async (cityCode: number, overrides: Partial<typeof places.$inferInsert> = {}): Promise<string> => {
    const id = `test-place-${uniqueSuffix()}`;
    await db.insert(places).values({ id, slug: id, name: `מקום בדיקה ${uniqueSuffix()}`, street: 'רחוב הבדיקה 1', cityCode, ...overrides });
    cleanupPlaceIds.add(id);
    return id;
  };

  // Same shape as `seedDailyLesson`, but pointing at a registered place
  // instead of carrying its own address text.
  const seedDailyPlaceBackedLesson = async (placeId: string, cityCode: number): Promise<{ lessonId: string; rabbiId: string }> => {
    const rabbiId = await createRabbi();
    const lessonId = `test-lesson-${uniqueSuffix()}`;
    await db.insert(lessons).values({
      id: lessonId,
      rabbiId,
      placeId,
      cityCode,
      audience: 'men',
      recurrenceKind: 'weekly',
      recurrenceWeekdays: [0, 1, 2, 3, 4, 5, 6],
      startTime: '19:00',
      durationMinutes: 60,
    });
    cleanupLessonIds.add(lessonId);
    return { lessonId, rabbiId };
  };

  test('an unauthenticated request is a 401, not an empty list', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/admin/lessons/does-not-exist/occurrences' });
    assert.equal(res.statusCode, 401);
  });

  test('an unknown lesson id is a 404', async () => {
    const cookie = await loginAsNewAdmin();
    const res = await app.inject({
      method: 'GET',
      url: '/v1/admin/lessons/does-not-exist/occurrences',
      headers: { cookie },
    });
    assert.equal(res.statusCode, 404);
  });

  test('a seeded weekly lesson returns its occurrences in the 14-day window', async () => {
    const cookie = await loginAsNewAdmin();
    const { lessonId, rabbiId, startTime, durationMinutes } = await seedDailyLesson();

    const res = await app.inject({
      method: 'GET',
      url: `/v1/admin/lessons/${lessonId}/occurrences`,
      headers: { cookie },
    });
    assert.equal(res.statusCode, 200);

    const body = res.json() as AdminOccurrenceListResponse;
    const from = todayInIsrael(new Date());
    const to = addDays(from, 13);
    const expectedDates = Array.from({ length: 14 }, (_, i) => addDays(from, i));

    assert.equal(body.items.length, 14, 'expected one occurrence per day of the 14-day window');
    assert.deepEqual(body.items.map((item) => item.date).sort(), expectedDates.sort());
    assert.ok(body.items.every((item) => item.date >= from && item.date <= to));
    for (const item of body.items) {
      assert.equal(item.lessonId, lessonId);
      assert.equal(item.startTime, startTime);
      assert.equal(item.rabbi.id, rabbiId);
      assert.equal(item.status, 'scheduled');
      assert.equal(item.endTime, addMinutes(startTime, durationMinutes));
    }
  });

  test('a cancelled exception resolves to status cancelled, and a modified one resolves the overridden time and place', async () => {
    const cookie = await loginAsNewAdmin();
    const { lessonId, cityCode } = await seedDailyLesson();

    const from = todayInIsrael(new Date());
    const cancelledDate = addDays(from, 1);
    const modifiedDate = addDays(from, 2);
    const overriddenStartTime = '21:15';
    const overriddenPlaceName = 'אולם חלופי לבדיקה';

    await db.insert(lessonExceptions).values({
      lessonId,
      date: cancelledDate,
      kind: 'cancelled',
      reason: 'בדיקה',
    });
    await db.insert(lessonExceptions).values({
      lessonId,
      date: modifiedDate,
      kind: 'modified',
      startTime: overriddenStartTime,
      addressName: overriddenPlaceName,
      addressStreet: 'רחוב חלופי 2',
      cityCode,
    });

    const res = await app.inject({
      method: 'GET',
      url: `/v1/admin/lessons/${lessonId}/occurrences`,
      headers: { cookie },
    });
    assert.equal(res.statusCode, 200);

    const body = res.json() as AdminOccurrenceListResponse;
    const cancelled = body.items.find((item) => item.date === cancelledDate);
    const modified = body.items.find((item) => item.date === modifiedDate);

    assert.ok(cancelled, 'expected an occurrence on the cancelled date');
    assert.equal(cancelled?.status, 'cancelled');
    assert.equal(cancelled?.cancellationReason, 'בדיקה');

    assert.ok(modified, 'expected an occurrence on the modified date');
    assert.equal(modified?.status, 'scheduled');
    assert.equal(modified?.startTime, overriddenStartTime);
    assert.equal(modified?.venue.name, overriddenPlaceName);
  });

  // Test 3 (admin half): the admin's own occurrence read resolves a
  // place-backed lesson to the place's own name and street too, and a
  // rename changes what it reports, exactly as the public search does.
  test("a place-backed lesson's occurrences resolve venue.kind 'place', and a rename changes what they report", async () => {
    const cookie = await loginAsNewAdmin();
    const cityCode = await jerusalemCode();
    const placeId = await createPlace(cityCode, { name: 'בית מדרש מקורי', street: 'רחוב מקורי 1' });
    const { lessonId } = await seedDailyPlaceBackedLesson(placeId, cityCode);

    const res = await app.inject({ method: 'GET', url: `/v1/admin/lessons/${lessonId}/occurrences`, headers: { cookie } });
    assert.equal(res.statusCode, 200);
    const body = res.json() as AdminOccurrenceListResponse;
    const [item] = body.items;
    assert.ok(item);
    assert.ok(item.venue.kind === 'place', `expected venue.kind 'place', got '${item.venue.kind}'`);
    assert.equal(item.venue.placeId, placeId);
    assert.equal(item.venue.name, 'בית מדרש מקורי');
    assert.equal(item.venue.street, 'רחוב מקורי 1');

    await db.update(places).set({ name: 'בית מדרש חדש', street: 'רחוב חדש 2' }).where(eq(places.id, placeId));

    const afterRename = await app.inject({ method: 'GET', url: `/v1/admin/lessons/${lessonId}/occurrences`, headers: { cookie } });
    const renamedBody = afterRename.json() as AdminOccurrenceListResponse;
    assert.equal(renamedBody.items[0]?.venue.name, 'בית מדרש חדש');
    assert.equal(renamedBody.items[0]?.venue.street, 'רחוב חדש 2');
  });

  test('creating a place returns the row it was given, and that row is retrievable through the admin API', async () => {
    const cookie = await loginAsNewAdmin();
    const cityCode = await jerusalemCode();
    const name = `מקום בדיקה ${uniqueSuffix()}`;
    const street = 'רחוב הבדיקה 5';

    const res = await app.inject({
      method: 'POST',
      url: '/v1/admin/places',
      headers: { cookie },
      payload: { name, street, cityCode },
    });
    assert.equal(res.statusCode, 201);

    const created = res.json() as AdminPlaceResponse;
    cleanupPlaceIds.add(created.id);
    assert.equal(created.name, name);
    assert.equal(created.street, street);
    assert.equal(created.cityCode, cityCode);

    const getRes = await app.inject({ method: 'GET', url: `/v1/admin/places/${created.id}`, headers: { cookie } });
    assert.equal(getRes.statusCode, 200);
    const fetched = getRes.json() as AdminPlaceResponse;
    assert.equal(fetched.name, name);
    assert.equal(fetched.street, street);
    assert.equal(fetched.cityCode, cityCode);
  });

  test('creating a place with a cityCode that resolves to no city is a 400 with error "unknown_city"', async () => {
    const cookie = await loginAsNewAdmin();
    const unknownCityCode = 999999999;

    const res = await app.inject({
      method: 'POST',
      url: '/v1/admin/places',
      headers: { cookie },
      payload: { name: `מקום בדיקה ${uniqueSuffix()}`, street: 'רחוב הבדיקה 5', cityCode: unknownCityCode },
    });
    assert.equal(res.statusCode, 400);

    const body = res.json() as { error: string };
    assert.equal(body.error, 'unknown_city');
  });
});

describe('admin API: dedications', () => {
  let app: FastifyInstance;
  const cleanupDedicationIds = new Set<string>();
  const cleanupAdminUserIds = new Set<string>();

  before(async () => {
    app = await buildAdminTestApp();
  });

  afterEach(async () => {
    for (const id of cleanupDedicationIds) await db.delete(dedications).where(eq(dedications.id, id));
    cleanupDedicationIds.clear();
    for (const id of cleanupAdminUserIds) await db.delete(adminUsers).where(eq(adminUsers.id, id));
    cleanupAdminUserIds.clear();
  });

  after(async () => {
    await app.close();
  });

  // Logs in through the real route, exactly as the lesson occurrences
  // describe above does: the guard under test is `requireAdminAuth` itself.
  const loginAsNewAdmin = async (): Promise<string> => {
    const email = `test-admin-${uniqueSuffix()}@example.com`;
    const password = 'Test-Password-123!';
    const record = await adminUserService.create({ name: 'מנהל בדיקה', email, username: `admin-${uniqueSuffix()}`, password });
    cleanupAdminUserIds.add(record.id);

    const res = await app.inject({ method: 'POST', url: '/v1/admin/login', payload: { identifier: email, password } });
    assert.equal(res.statusCode, 200);
    const cookie = res.cookies.find((c) => c.name === SESSION_COOKIE_NAME);
    if (!cookie) throw new Error('expected the admin login route to set a session cookie');
    return `${cookie.name}=${cookie.value}`;
  };

  const validCreateBody = (type: DedicationType, overrides: Partial<CreateDedicationRequest> = {}): CreateDedicationRequest => {
    const startsOn = todayInIsrael(new Date());
    return {
      type,
      honoredName: 'משה כהן',
      honoredGender: 'male',
      closingLineEnabled: false,
      startsOn,
      endsOn: addDays(startsOn, 7),
      ...overrides,
    };
  };

  const createDedication = async (
    cookie: string,
    type: DedicationType,
    overrides: Partial<CreateDedicationRequest> = {},
  ): Promise<AdminDedication> => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/admin/dedications',
      headers: { cookie },
      payload: validCreateBody(type, overrides),
    });
    assert.equal(res.statusCode, 201, JSON.stringify(res.json()));
    const record = res.json() as AdminDedication;
    cleanupDedicationIds.add(record.id);
    return record;
  };

  test('an unauthenticated request is a 401 on every endpoint, the preview included', async () => {
    const responses = await Promise.all([
      app.inject({ method: 'GET', url: '/v1/admin/dedications' }),
      app.inject({ method: 'GET', url: '/v1/admin/dedications/does-not-exist' }),
      app.inject({ method: 'POST', url: '/v1/admin/dedications', payload: validCreateBody('memorial') }),
      app.inject({ method: 'POST', url: '/v1/admin/dedications/preview', payload: { type: 'memorial' } }),
      app.inject({ method: 'PATCH', url: '/v1/admin/dedications/does-not-exist', payload: validCreateBody('memorial') }),
      app.inject({ method: 'POST', url: '/v1/admin/dedications/does-not-exist/takedown', payload: { reason: 'בדיקה' } }),
    ]);
    for (const res of responses) assert.equal(res.statusCode, 401);
  });

  for (const type of ['memorial', 'healing', 'success'] as const satisfies readonly DedicationType[]) {
    test(`creates a ${type} dedication`, async () => {
      const cookie = await loginAsNewAdmin();
      const record = await createDedication(cookie, type);
      assert.equal(record.type, type);
      assert.equal(record.state, 'live');
      assert.ok(record.display.formulaLine.length > 0);
    });
  }

  describe('GET /v1/admin/dedications/:id', () => {
    // The view and edit screens are opened cold at their own URL (a deep
    // link, a refresh, a bookmark), with no list response in hand, so this
    // route has to work on its own.
    test('a created record is readable by id, with its display intact', async () => {
      const cookie = await loginAsNewAdmin();
      const record = await createDedication(cookie, 'memorial', { honorific: 'zl', parentName: 'אברהם' });

      const res = await app.inject({ method: 'GET', url: `/v1/admin/dedications/${record.id}`, headers: { cookie } });
      assert.equal(res.statusCode, 200);
      const fetched = res.json() as AdminDedication;
      assert.equal(fetched.id, record.id);
      assert.deepEqual(fetched.display, record.display);
    });

    test('an unknown id is a 404', async () => {
      const cookie = await loginAsNewAdmin();
      const res = await app.inject({ method: 'GET', url: '/v1/admin/dedications/does-not-exist', headers: { cookie } });
      assert.equal(res.statusCode, 404);
    });

    // Takedown removes a dedication from the public page, never from the
    // admin's own view of it: the same guarantee the list test above holds,
    // now for a direct-by-id read.
    test('a taken-down record is still readable by id', async () => {
      const cookie = await loginAsNewAdmin();
      const record = await createDedication(cookie, 'healing');
      const reason = 'בקשת המשפחה';
      const takedownRes = await app.inject({
        method: 'POST',
        url: `/v1/admin/dedications/${record.id}/takedown`,
        headers: { cookie },
        payload: { reason },
      });
      assert.equal(takedownRes.statusCode, 200);

      const res = await app.inject({ method: 'GET', url: `/v1/admin/dedications/${record.id}`, headers: { cookie } });
      assert.equal(res.statusCode, 200);
      const fetched = res.json() as AdminDedication;
      assert.equal(fetched.state, 'takenDown');
      assert.equal(fetched.takenDownReason, reason);
    });
  });

  test('a honorific outside the closed list is a 400', async () => {
    const cookie = await loginAsNewAdmin();
    const res = await app.inject({
      method: 'POST',
      url: '/v1/admin/dedications',
      headers: { cookie },
      payload: { ...validCreateBody('memorial'), honorific: 'not-a-real-honorific' },
    });
    assert.equal(res.statusCode, 400);
  });

  test('a honorific on a healing dedication is a 400, never silently dropped', async () => {
    const cookie = await loginAsNewAdmin();
    const res = await app.inject({
      method: 'POST',
      url: '/v1/admin/dedications',
      headers: { cookie },
      payload: validCreateBody('healing', { honorific: 'zl' }),
    });
    assert.equal(res.statusCode, 400);
  });

  test('a honorific on a success dedication is a 400, never silently dropped', async () => {
    const cookie = await loginAsNewAdmin();
    const res = await app.inject({
      method: 'POST',
      url: '/v1/admin/dedications',
      headers: { cookie },
      payload: validCreateBody('success', { honorific: 'ah' }),
    });
    assert.equal(res.statusCode, 400);
  });

  test('a honorific on a memorial dedication succeeds', async () => {
    const cookie = await loginAsNewAdmin();
    const record = await createDedication(cookie, 'memorial', { honorific: 'zl' });
    assert.equal(record.honorific, 'zl');
  });

  test('a dedication with a name and no gender and no parent name succeeds, for a whole-family dedication', async () => {
    const cookie = await loginAsNewAdmin();
    const record = await createDedication(cookie, 'success', { honoredGender: undefined, honoredName: 'משפחת לביא' });
    assert.equal(record.honoredGender, undefined);
    assert.equal(record.display.parentLine, undefined);
  });

  test('a parent name without a gender is a 400', async () => {
    const cookie = await loginAsNewAdmin();
    const res = await app.inject({
      method: 'POST',
      url: '/v1/admin/dedications',
      headers: { cookie },
      payload: validCreateBody('success', { honoredGender: undefined, parentName: 'שלמה' }),
    });
    assert.equal(res.statusCode, 400);
  });

  test('endsOn before startsOn is a 400', async () => {
    const cookie = await loginAsNewAdmin();
    const startsOn = todayInIsrael(new Date());
    const res = await app.inject({
      method: 'POST',
      url: '/v1/admin/dedications',
      headers: { cookie },
      payload: validCreateBody('memorial', { startsOn, endsOn: addDays(startsOn, -1) }),
    });
    assert.equal(res.statusCode, 400);
  });

  test('a name containing an ASCII quote is rejected with a 400, not silently stripped', async () => {
    const cookie = await loginAsNewAdmin();
    const strippedForm = 'משה הגדול כהן';
    const res = await app.inject({
      method: 'POST',
      url: '/v1/admin/dedications',
      headers: { cookie },
      payload: validCreateBody('memorial', { honoredName: `משה "הגדול" כהן` }),
    });
    assert.equal(res.statusCode, 400);

    const stored = await db.select().from(dedications).where(eq(dedications.honoredName, strippedForm));
    assert.equal(stored.length, 0, 'a stripped version of the rejected name must never be persisted, only rejected');
  });

  test('takedown sets the timestamp and the reason, the record stays readable through the admin API, and it is gone from /v1/home', async () => {
    const cookie = await loginAsNewAdmin();
    const startsOn = todayInIsrael(new Date());
    const record = await createDedication(cookie, 'success', { startsOn, endsOn: addDays(startsOn, 1) });

    const beforeTakedown = await app.inject({ method: 'GET', url: '/v1/home' });
    const beforeIds = (beforeTakedown.json() as HomeResponse).dedications.flatMap((group) => group.items.map((item) => item.id));
    assert.ok(beforeIds.includes(record.id), 'expected the freshly created, in-window dedication to be served before takedown');

    const reason = 'בקשת המשפחה';
    const takedownRes = await app.inject({
      method: 'POST',
      url: `/v1/admin/dedications/${record.id}/takedown`,
      headers: { cookie },
      payload: { reason },
    });
    assert.equal(takedownRes.statusCode, 200);
    const takenDown = takedownRes.json() as AdminDedication;
    assert.equal(takenDown.state, 'takenDown');
    assert.equal(takenDown.takenDownReason, reason);

    const [takenDownRow] = await db.select().from(dedications).where(eq(dedications.id, record.id));
    assert.ok(takenDownRow?.takenDownAt, 'expected takedown to set takenDownAt on the row');

    const listRes = await app.inject({ method: 'GET', url: '/v1/admin/dedications?pageSize=50', headers: { cookie } });
    assert.equal(listRes.statusCode, 200);
    const listed = (listRes.json() as { items: AdminDedication[] }).items.find((item) => item.id === record.id);
    assert.ok(listed, 'expected the taken-down record to stay readable through the admin API');
    assert.equal(listed?.state, 'takenDown');
    assert.equal(listed?.takenDownReason, reason);

    const afterTakedown = await app.inject({ method: 'GET', url: '/v1/home' });
    const afterIds = (afterTakedown.json() as HomeResponse).dedications.flatMap((group) => group.items.map((item) => item.id));
    assert.ok(!afterIds.includes(record.id), 'expected a taken-down dedication to be gone from /v1/home');
  });

  test('takedown without a reason is a 400', async () => {
    const cookie = await loginAsNewAdmin();
    const record = await createDedication(cookie, 'healing');
    const res = await app.inject({
      method: 'POST',
      url: `/v1/admin/dedications/${record.id}/takedown`,
      headers: { cookie },
      payload: {},
    });
    assert.equal(res.statusCode, 400);
  });

  // This is the one assertion that fails if a second composer ever appears
  // beside `composeDedicationText`: both the create response's `display`
  // and this preview response must come from that single function.
  test("the preview deep-equals the created record's display for the same fields", async () => {
    const cookie = await loginAsNewAdmin();
    const fields = {
      type: 'memorial' as DedicationType,
      honoredName: 'יוסף לוי',
      honorific: 'zl' as const,
      honoredGender: 'male' as const,
      parentName: 'אברהם',
      donorFamilyName: 'לוי',
      closingLineEnabled: true,
    };
    const record = await createDedication(cookie, fields.type, fields);

    const previewRes = await app.inject({
      method: 'POST',
      url: '/v1/admin/dedications/preview',
      headers: { cookie },
      payload: fields,
    });
    assert.equal(previewRes.statusCode, 200);

    assert.deepEqual(previewRes.json(), record.display);
  });

  test('a preview draft with only a type is a normal 200, never a 400', async () => {
    const cookie = await loginAsNewAdmin();
    const res = await app.inject({
      method: 'POST',
      url: '/v1/admin/dedications/preview',
      headers: { cookie },
      payload: { type: 'memorial' },
    });
    assert.equal(res.statusCode, 200);
  });

  // The preview renders the composed string before anything is stored, so it
  // must reject a honorific outside a memorial exactly as create and update
  // do: without this the admin's live preview can print `ז״ל` next to a
  // living person's name even though the save is (correctly) rejected.
  test('a honorific on a non-memorial preview draft is a 400', async () => {
    const cookie = await loginAsNewAdmin();
    const responses = await Promise.all([
      app.inject({
        method: 'POST',
        url: '/v1/admin/dedications/preview',
        headers: { cookie },
        payload: { type: 'healing', honoredName: 'דוד', honorific: 'zl' },
      }),
      app.inject({
        method: 'POST',
        url: '/v1/admin/dedications/preview',
        headers: { cookie },
        payload: { type: 'success', honoredName: 'דוד', honorific: 'zl' },
      }),
    ]);
    for (const res of responses) assert.equal(res.statusCode, 400);
  });

  test('a honorific on a memorial preview draft is a 200 whose nameLine ends with the suffix', async () => {
    const cookie = await loginAsNewAdmin();
    const res = await app.inject({
      method: 'POST',
      url: '/v1/admin/dedications/preview',
      headers: { cookie },
      payload: { type: 'memorial', honoredName: 'דוד', honorific: 'zl' },
    });
    assert.equal(res.statusCode, 200);
    const text = res.json() as { nameLine: string };
    assert.ok(text.nameLine.endsWith('ז״ל'), `expected the name line to end with the suffix, got "${text.nameLine}"`);
  });
});

// The one place the shared Postgres connection (`rawClient`, backing both
// describes above) is closed in this file: ending it inside either
// describe's own `after` would break whichever one runs next.
after(async () => {
  await rawClient.end({ timeout: 5 });
});
