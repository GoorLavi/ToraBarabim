import assert from 'node:assert/strict';
import { after, afterEach, before, describe, test } from 'node:test';

import type { AdminOccurrenceListResponse } from '@torabarabim/common';
import { eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { nanoid } from 'nanoid';

import { db } from '../src/db/client';
import { adminUsers, cities, lessonExceptions, lessons, rabbis } from '../src/db/schema';
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
    assert.equal(modified?.place.name, overriddenPlaceName);
  });
});
