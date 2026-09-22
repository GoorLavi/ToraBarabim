import assert from 'node:assert/strict';
import { after, afterEach, before, describe, test } from 'node:test';

import type { AdminDedication, AdminOccurrenceListResponse, CreateDedicationRequest, DedicationType, HomeResponse } from '@torabarabim/common';
import { eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { nanoid } from 'nanoid';

import { db } from '../src/db/client';
import { adminUsers, cities, dedications, lessonExceptions, lessons, rabbis } from '../src/db/schema';
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
      placeName: 'בית כנסת הבדיקה',
      placeStreet: 'רחוב הבדיקה 1',
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
      placeName: overriddenPlaceName,
      placeStreet: 'רחוב חלופי 2',
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
    assert.equal(modified?.place.name, overriddenPlaceName);
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
});

// The one place the shared Postgres connection (`rawClient`, backing both
// describes above) is closed in this file: ending it inside either
// describe's own `after` would break whichever one runs next.
after(async () => {
  await rawClient.end({ timeout: 5 });
});
