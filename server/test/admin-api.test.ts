import assert from 'node:assert/strict';
import { after, afterEach, before, describe, test } from 'node:test';

import type { AdminOccurrenceListResponse, AdminPlaceResponse } from '@torabarabim/common';
import { eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { nanoid } from 'nanoid';

import { db } from '../src/db/client';
import { adminUsers, cities, lessonExceptions, lessons, places, rabbis } from '../src/db/schema';
import { addDays, todayInIsrael } from '../src/service/lesson/israel-time';
import { addMinutes } from '../src/service/lesson/occurrence';
import { SESSION_COOKIE_NAME } from '../src/service/admin-auth/consts';
import * as adminUserService from '../src/service/admin-user/admin-user';
import { assertDatabaseReachable, buildAdminTestApp, rawClient } from './app-harness';

const SEEDED_CITY_NAME = 'ירושלים';

const uniqueSuffix = (): string => nanoid(8);

describe('admin API: lesson occurrences', () => {
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

  after(async () => {
    await app.close();
    await rawClient.end({ timeout: 5 });
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

  // `POST /v1/admin/places` had zero test coverage: this is the owner's
  // "how was creating a place never tested" answer, for the happy path and
  // the unknown-city rejection.
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
