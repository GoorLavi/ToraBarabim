import assert from 'node:assert/strict';
import { after, afterEach, before, describe, mock, test } from 'node:test';

import type { CourseDetailResponse, CourseResponse, HomeResponse, PlaceDetailResponse, RabbiDetailResponse, WomenAreaResponse } from '@torabarabim/common';
import { eq, inArray } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { nanoid } from 'nanoid';
import postgres from 'postgres';

import { db } from '../src/db/client';
import { adminUsers, cities, courses, coursePhotos, places, rabbis } from '../src/db/schema';
import * as adminPlaceService from '../src/service/admin-place/admin-place';
import * as adminRabbiAccountService from '../src/service/admin-rabbi-account/admin-rabbi-account';
import { RABBI_SESSION_COOKIE_NAME, SESSION_COOKIE_NAME } from '../src/service/admin-auth/consts';
import * as adminUserService from '../src/service/admin-user/admin-user';
import { addDays, todayInIsrael } from '../src/service/lesson/israel-time';
import storage from '../src/storage/storage';
import { assertDatabaseReachable, buildCourseTestApp, rawClient } from './app-harness';

const SEEDED_CITY_NAME = 'ירושלים';
const uniqueSuffix = (): string => nanoid(8);

// Mirrors `invariants.test.ts`'s own unwrap: drizzle-orm's postgres-js
// driver wraps the real `PostgresError` (with its SQLSTATE `code` and, for
// a CHECK violation, `constraint_name`) on `.cause`, not on the thrown
// error itself.
const asPostgresError = (error: unknown): postgres.PostgresError | undefined => {
  const cause = error instanceof Error ? error.cause : undefined;
  return cause instanceof postgres.PostgresError ? cause : undefined;
};
const CHECK_VIOLATION = '23514';

// `readPngDimensions` reads width/height from fixed byte offsets (16, 20)
// with no real decode, matching `place-api.test.ts`'s own technique: a
// synthetic 24-byte buffer carrying just the PNG signature and those two
// values is exactly what it needs, real IHDR chunk bytes or not.
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const buildPngBytes = (width: number, height: number): Buffer => {
  const bytes = Buffer.alloc(24);
  PNG_SIGNATURE.forEach((byte, index) => {
    bytes[index] = byte;
  });
  bytes.writeUInt32BE(width, 16);
  bytes.writeUInt32BE(height, 20);
  return bytes;
};

describe('course API', () => {
  let app: FastifyInstance;
  const cleanupCourseIds = new Set<string>();
  const cleanupRabbiIds = new Set<string>();
  const cleanupPlaceIds = new Set<string>();
  const cleanupAdminUserIds = new Set<string>();

  before(async () => {
    await assertDatabaseReachable();
    app = await buildCourseTestApp();
  });

  afterEach(async () => {
    mock.restoreAll();
    if (cleanupCourseIds.size) {
      await db.delete(coursePhotos).where(inArray(coursePhotos.courseId, [...cleanupCourseIds]));
      await db.delete(courses).where(inArray(courses.id, [...cleanupCourseIds]));
      cleanupCourseIds.clear();
    }
    for (const id of cleanupPlaceIds) await db.delete(places).where(eq(places.id, id));
    cleanupPlaceIds.clear();
    for (const id of cleanupRabbiIds) await db.delete(rabbis).where(eq(rabbis.id, id));
    cleanupRabbiIds.clear();
    for (const id of cleanupAdminUserIds) await db.delete(adminUsers).where(eq(adminUsers.id, id));
    cleanupAdminUserIds.clear();
  });

  after(async () => {
    await app.close();
    await rawClient.end({ timeout: 5 });
  });

  const jerusalemCode = async (): Promise<number> => {
    const rows = await db.select({ code: cities.code }).from(cities).where(eq(cities.nameHe, SEEDED_CITY_NAME)).limit(1);
    const row = rows[0];
    if (!row) throw new Error('expected the seeded city to exist');
    return row.code;
  };

  const createRabbi = async (honorific: 'rav' | 'rabbanit' = 'rav'): Promise<string> => {
    const id = `test-rabbi-${uniqueSuffix()}`;
    await db.insert(rabbis).values({ id, name: `רב בדיקה ${uniqueSuffix()}`, honorific });
    cleanupRabbiIds.add(id);
    return id;
  };

  const createPlace = async (): Promise<string> => {
    const cityCode = await jerusalemCode();
    const place = await adminPlaceService.create({ name: `מקום בדיקה ${uniqueSuffix()}`, street: 'רחוב הבדיקה 1', cityCode });
    cleanupPlaceIds.add(place.id);
    return place.id;
  };

  const loginAsRabbi = async (rabbiId: string): Promise<string> => {
    const email = `test-rabbi-account-${uniqueSuffix()}@example.com`;
    const created = await adminRabbiAccountService.create(rabbiId, { email, username: `rabbi-${uniqueSuffix()}` });
    const res = await app.inject({ method: 'POST', url: '/v1/panel/login', payload: { identifier: email, password: created.temporaryPassword } });
    assert.equal(res.statusCode, 200);
    const cookie = res.cookies.find((c) => c.name === RABBI_SESSION_COOKIE_NAME);
    if (!cookie) throw new Error('expected the panel login route to set the rabbi session cookie');
    return `${cookie.name}=${cookie.value}`;
  };

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

  interface CourseFixture {
    id?: string;
    rabbiId?: string | null;
    teacherName?: string;
    placeId?: string;
    cityCode?: number;
    audience?: 'men' | 'women' | 'mixed';
    openingDate?: string;
    weeks?: number;
    joinableAfterOpening?: boolean;
    registrationClosedAt?: Date | null;
    closeReason?: 'closed' | 'full' | null;
    coverKey?: string;
    name?: string;
    topic?: 'gemara' | 'halacha' | 'parasha' | 'mussar' | 'chassidut' | 'tanach' | 'machshava' | 'other';
  }

  const insertCourse = async (fixture: CourseFixture = {}): Promise<string> => {
    const id = fixture.id ?? `test-course-${uniqueSuffix()}`;
    const placeId = fixture.placeId ?? null;
    const cityCode = placeId ? null : (fixture.cityCode ?? (await jerusalemCode()));

    await db.insert(courses).values({
      id,
      name: fixture.name ?? 'קורס בדיקה',
      description: 'תיאור קורס לבדיקה',
      rabbiId: fixture.rabbiId ?? null,
      teacherName: fixture.rabbiId ? null : (fixture.teacherName ?? 'מורה בדיקה'),
      openingDate: fixture.openingDate ?? '2026-12-01',
      weeks: fixture.weeks ?? 10,
      sessions: 10,
      placeId,
      addressName: placeId ? null : 'בניין בדיקה',
      addressStreet: placeId ? null : 'רחוב הבדיקה 1',
      cityCode,
      audience: fixture.audience ?? 'men',
      joinableAfterOpening: fixture.joinableAfterOpening ?? false,
      contactPhone: '0501234567',
      coverKey: fixture.coverKey ?? `test/${id}/cover.png`,
      registrationClosedAt: fixture.registrationClosedAt ?? null,
      closeReason: fixture.closeReason ?? null,
      topic: fixture.topic ?? null,
    });
    cleanupCourseIds.add(id);
    return id;
  };

  const insertCoursePhoto = async (courseId: string, position: number): Promise<string> => {
    const id = `test-photo-${uniqueSuffix()}`;
    await db.insert(coursePhotos).values({ id, courseId, storageKey: `test/${courseId}/gallery-${position}.png`, position });
    return id;
  };

  const readCourseRow = async (id: string) => {
    const rows = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
    return rows[0];
  };

  const stubStorage = (): void => {
    mock.method(storage, 'put', async (key: string) => `https://storage.test/${key}`);
    mock.method(storage, 'copy', async () => undefined);
    mock.method(storage, 'remove', async () => undefined);
  };

  const putCallCount = (): number => (storage.put as unknown as { mock: { callCount: () => number } }).mock.callCount();

  const validCourseFields = (cityCode: number, overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
    name: 'קורס בדיקה',
    description: 'תיאור הקורס',
    openingDate: '2026-12-01',
    weeks: 10,
    sessions: 10,
    venue: { kind: 'address', name: 'בניין בדיקה', street: 'רחוב 1', cityCode },
    audience: 'men',
    joinableAfterOpening: false,
    contactPhone: '0501234567',
    ...overrides,
  });

  // `Blob`'s constructor type wants an `ArrayBuffer`-backed view; Node's
  // `Buffer` is typed against `ArrayBufferLike` (which also allows a
  // `SharedArrayBuffer`), so a plain `Buffer` does not structurally match
  // `BlobPart` even though it always works at runtime. Wrapping it in a
  // fresh `Uint8Array` satisfies the type without copying semantics that
  // matter here.
  const toBlobPart = (bytes: Buffer): Uint8Array<ArrayBuffer> => {
    const view = new Uint8Array(new ArrayBuffer(bytes.byteLength));
    view.set(bytes);
    return view;
  };

  const multipartBody = (fields: Record<string, unknown>, coverBytes: Buffer = buildPngBytes(600, 600)): FormData => {
    const form = new FormData();
    form.append('course', JSON.stringify(fields));
    form.append('cover', new Blob([toBlobPart(coverBytes)], { type: 'image/png' }), 'cover.png');
    return form;
  };

  // The single-file upload routes (`/cover`, `/photos`) read `request.file()`,
  // which needs a real multipart body: a raw buffer payload has no
  // multipart content-type and would 415 before the route's own logic ever
  // runs, regardless of what is under test.
  const singleFileBody = (bytes: Buffer): FormData => {
    const form = new FormData();
    form.append('file', new Blob([toBlobPart(bytes)], { type: 'image/png' }), 'photo.png');
    return form;
  };

  // 1. Course page.
  test('before any course exists in this suite, GET /v1/home has no course row', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/home' });
    assert.equal(res.statusCode, 200);
    const body = res.json() as HomeResponse;
    assert.ok(!body.rows.some((row) => row.kind === 'courses'));
  });

  test('an open course returns 200 with contactPhone; a course past its closed week returns 200, closed, with no phone anywhere', async () => {
    const openId = await insertCourse({ openingDate: addDays(todayInIsrael(new Date()), 5), topic: 'gemara' });
    const openRes = await app.inject({ method: 'GET', url: `/v1/courses/${openId}` });
    assert.equal(openRes.statusCode, 200);
    const openBody = openRes.json() as CourseDetailResponse;
    assert.equal(openBody.state.status, 'notOpen');
    assert.equal(typeof openBody.state.contactPhone, 'string');
    assert.deepEqual(openBody.topic, { value: 'gemara' });

    const today = todayInIsrael(new Date());
    const goneId = await insertCourse({ openingDate: addDays(today, -8), weeks: 1, joinableAfterOpening: false });
    const goneRes = await app.inject({ method: 'GET', url: `/v1/courses/${goneId}` });
    assert.equal(goneRes.statusCode, 200);
    const goneBody = goneRes.json() as CourseDetailResponse;
    assert.equal(goneBody.state.status, 'closed');
    assert.ok(!JSON.stringify(goneBody).includes('contactPhone'));
  });

  test('an unknown course id returns 404', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/courses/does-not-exist' });
    assert.equal(res.statusCode, 404);
  });

  // 2. Home row membership and order.
  test('the home row holds exactly the listed general-scope courses, ordered, right after the first lesson row', async () => {
    const today = todayInIsrael(new Date());
    const farFuture = await insertCourse({ openingDate: addDays(today, 400) });
    const openJoinable = await insertCourse({ openingDate: addDays(today, -30), weeks: 500, joinableAfterOpening: true });
    await insertCourse({ openingDate: today, joinableAfterOpening: false }); // closes today itself, still listed
    const closedSixDaysAgo = await insertCourse({ openingDate: addDays(today, -6), joinableAfterOpening: false });
    await insertCourse({ openingDate: addDays(today, -7), joinableAfterOpening: false }); // gone
    await insertCourse({ openingDate: addDays(today, 10), audience: 'women' }); // out of general scope

    const res = await app.inject({ method: 'GET', url: '/v1/home' });
    assert.equal(res.statusCode, 200);
    const body = res.json() as HomeResponse;

    assert.equal(body.rows[0]?.kind, 'lessons');
    assert.equal(body.rows[1]?.kind, 'courses');

    const courseRow = body.rows.find((row) => row.kind === 'courses');
    if (!courseRow || courseRow.kind !== 'courses') throw new Error('expected a course row');
    const ids = courseRow.items.map((item) => item.id);
    assert.ok(ids.includes(openJoinable));
    assert.ok(ids.includes(farFuture));
    assert.ok(ids.includes(closedSixDaysAgo));
    assert.equal(ids.indexOf(openJoinable) < ids.indexOf(farFuture), true, 'the open course opens sooner than the far-future one');
    assert.equal(ids.indexOf(closedSixDaysAgo), ids.length - 1, 'the closed course sits after every not-closed one');

    const lessonRows = body.rows.filter((row) => row.kind === 'lessons');
    for (const row of lessonRows) assert.ok(row.items.every((item) => typeof item.lessonId === 'string'));
  });

  // 3. A single listed course sends the row.
  test('a single listed course still sends the row (no minimum of 3 applied to courses)', async () => {
    await insertCourse();
    const res = await app.inject({ method: 'GET', url: '/v1/home' });
    const body = res.json() as HomeResponse;
    const courseRow = body.rows.find((row) => row.kind === 'courses');
    if (!courseRow || courseRow.kind !== 'courses') throw new Error('expected a course row');
    assert.equal(courseRow.items.length, 1);
  });

  // 4. Scope.
  test("women's courses (rav-linked, unlinked and mixed) scope correctly", async () => {
    const ravId = await createRabbi('rav');
    const ravWomen = await insertCourse({ rabbiId: ravId, audience: 'women' });
    const unlinkedWomen = await insertCourse({ audience: 'women' });
    const mixed = await insertCourse({ rabbiId: ravId, audience: 'mixed' });

    const [womenRes, homeRes, rabbiRes] = await Promise.all([
      app.inject({ method: 'GET', url: '/v1/women' }),
      app.inject({ method: 'GET', url: '/v1/home' }),
      app.inject({ method: 'GET', url: `/v1/rabbis/${ravId}` }),
    ]);

    const womenBody = womenRes.json() as WomenAreaResponse;
    const womenCourseIds = womenBody.courses.map((c) => c.id);
    assert.ok(womenCourseIds.includes(ravWomen));
    assert.ok(womenCourseIds.includes(unlinkedWomen));
    assert.ok(womenCourseIds.includes(mixed));

    const homeBody = homeRes.json() as HomeResponse;
    const homeCourseIds = (homeBody.rows.find((row) => row.kind === 'courses') as { items: { id: string }[] } | undefined)?.items.map((i) => i.id) ?? [];
    assert.ok(!homeCourseIds.includes(ravWomen));
    assert.ok(!homeCourseIds.includes(unlinkedWomen));
    assert.ok(homeCourseIds.includes(mixed));

    const rabbiBody = rabbiRes.json() as RabbiDetailResponse;
    const rabbiCourseIds = rabbiBody.courses.map((c) => c.id);
    assert.ok(!rabbiCourseIds.includes(ravWomen), 'a rav women-only course leaves his own general-scope page');
    assert.ok(rabbiCourseIds.includes(mixed));
  });

  test("a rabbanit's course is on her own page", async () => {
    const rabbanitId = await createRabbi('rabbanit');
    const courseId = await insertCourse({ rabbiId: rabbanitId, audience: 'women' });
    const res = await app.inject({ method: 'GET', url: `/v1/rabbis/${rabbanitId}` });
    const body = res.json() as RabbiDetailResponse;
    assert.ok(body.courses.map((c) => c.id).includes(courseId));
  });

  // 5. Rabbi and place pages.
  test('a general course is on the rav page; a place-backed course is on the place page; an address-only course is on no place page; a course past its week is on neither', async () => {
    const ravId = await createRabbi('rav');
    const placeId = await createPlace();
    const today = todayInIsrael(new Date());

    const generalCourse = await insertCourse({ rabbiId: ravId, openingDate: addDays(today, 20) });
    const placeCourse = await insertCourse({ placeId, openingDate: addDays(today, 20) });
    const addressCourse = await insertCourse({ openingDate: addDays(today, 20) });
    const goneCourse = await insertCourse({ openingDate: addDays(today, -7), joinableAfterOpening: false });

    const [rabbiRes, placeRes] = await Promise.all([
      app.inject({ method: 'GET', url: `/v1/rabbis/${ravId}` }),
      app.inject({ method: 'GET', url: `/v1/places/${placeId}` }),
    ]);
    const rabbiBody = rabbiRes.json() as RabbiDetailResponse;
    const placeBody = placeRes.json() as PlaceDetailResponse;

    assert.ok(rabbiBody.courses.map((c) => c.id).includes(generalCourse));
    assert.ok(!rabbiBody.courses.map((c) => c.id).includes(goneCourse));
    assert.ok(placeBody.courses.map((c) => c.id).includes(placeCourse));
    assert.ok(!placeBody.courses.map((c) => c.id).includes(addressCourse));
    assert.ok(!placeBody.courses.map((c) => c.id).includes(goneCourse));
  });

  // 6. Deactivated place.
  test('a deactivated place still answers 200 for its course, with venue.kind: address', async () => {
    const placeId = await createPlace();
    const courseId = await insertCourse({ placeId });
    await adminPlaceService.update(placeId, { isActive: false });

    const res = await app.inject({ method: 'GET', url: `/v1/courses/${courseId}` });
    assert.equal(res.statusCode, 200);
    const body = res.json() as CourseDetailResponse;
    assert.equal(body.venue.kind, 'address');
  });

  // 7. Scoping (0015).
  test("rabbi B's requests on rabbi A's course each answer 404, and A's course is unchanged", async () => {
    const rabbiA = await createRabbi('rav');
    const rabbiB = await createRabbi('rav');
    const courseId = await insertCourse({ rabbiId: rabbiA });
    const cookieB = await loginAsRabbi(rabbiB);

    const before = await readCourseRow(courseId);

    const cityCode = await jerusalemCode();
    const getRes = await app.inject({ method: 'GET', url: `/v1/rabbi/courses/${courseId}`, headers: { cookie: cookieB } });
    assert.equal(getRes.statusCode, 404);

    const patchRes = await app.inject({ method: 'PATCH', url: `/v1/rabbi/courses/${courseId}`, headers: { cookie: cookieB }, payload: validCourseFields(cityCode) });
    assert.equal(patchRes.statusCode, 404);

    const closeRes = await app.inject({ method: 'POST', url: `/v1/rabbi/courses/${courseId}/close`, headers: { cookie: cookieB } });
    assert.equal(closeRes.statusCode, 404);

    stubStorage();
    const photoRes = await app.inject({ method: 'POST', url: `/v1/rabbi/courses/${courseId}/photos`, headers: { cookie: cookieB }, payload: singleFileBody(buildPngBytes(600, 600)) });
    assert.equal(photoRes.statusCode, 404);

    const deletePhotoRes = await app.inject({ method: 'DELETE', url: `/v1/rabbi/courses/${courseId}/photos/does-not-matter`, headers: { cookie: cookieB } });
    assert.equal(deletePhotoRes.statusCode, 404);

    const deleteRes = await app.inject({ method: 'DELETE', url: `/v1/rabbi/courses/${courseId}`, headers: { cookie: cookieB } });
    assert.equal(deleteRes.statusCode, 404);

    const after = await readCourseRow(courseId);
    assert.deepEqual(after, before);
  });

  // 8. Rabbanit guard, rabbi path.
  test("a rabbanit's PATCH and multipart POST with audience 'men' are both refused", async () => {
    const rabbanitId = await createRabbi('rabbanit');
    const courseId = await insertCourse({ rabbiId: rabbanitId, audience: 'women' });
    const cookie = await loginAsRabbi(rabbanitId);
    const cityCode = await jerusalemCode();
    const before = await readCourseRow(courseId);

    const patchRes = await app.inject({
      method: 'PATCH',
      url: `/v1/rabbi/courses/${courseId}`,
      headers: { cookie },
      payload: validCourseFields(cityCode, { audience: 'men' }),
    });
    assert.equal(patchRes.statusCode, 400);
    assert.equal(patchRes.json().error, 'rabbanit_audience_must_be_women');
    assert.deepEqual(await readCourseRow(courseId), before);

    stubStorage();
    const createRes = await app.inject({
      method: 'POST',
      url: '/v1/rabbi/courses',
      headers: { cookie },
      payload: multipartBody(validCourseFields(cityCode, { audience: 'men' })),
    });
    assert.equal(createRes.statusCode, 400);
    assert.equal(createRes.json().error, 'rabbanit_audience_must_be_women');
    assert.equal(putCallCount(), 0, 'the guard must run before storage.put');
  });

  // 9. Photo cap and floor.
  test('the gallery cap and the photo floor both refuse before storage.put is ever called', async () => {
    const rabbiId = await createRabbi();
    const linkedCourseId = await insertCourse({ rabbiId });
    for (let position = 0; position < 8; position += 1) await insertCoursePhoto(linkedCourseId, position);
    const ownerCookie = await loginAsRabbi(rabbiId);

    stubStorage();
    const capRes = await app.inject({
      method: 'POST',
      url: `/v1/rabbi/courses/${linkedCourseId}/photos`,
      headers: { cookie: ownerCookie },
      payload: singleFileBody(buildPngBytes(600, 600)),
    });
    assert.equal(capRes.statusCode, 409);
    assert.equal(capRes.json().error, 'course_photo_limit');
    const photosAfterCap = await db.select().from(coursePhotos).where(eq(coursePhotos.courseId, linkedCourseId));
    assert.equal(photosAfterCap.length, 8);
    assert.equal(putCallCount(), 0);

    const roomyRabbiId = await createRabbi();
    const roomyCourseId = await insertCourse({ rabbiId: roomyRabbiId });
    const roomyCookie = await loginAsRabbi(roomyRabbiId);

    mock.restoreAll();
    stubStorage();
    const smallRes = await app.inject({
      method: 'POST',
      url: `/v1/rabbi/courses/${roomyCourseId}/photos`,
      headers: { cookie: roomyCookie },
      payload: singleFileBody(buildPngBytes(599, 599)),
    });
    assert.equal(smallRes.statusCode, 400);
    assert.equal(smallRes.json().error, 'photo_too_small');
    assert.equal(putCallCount(), 0);
  });

  // 10. Close and full are final.
  test('close and full are each final, and the columns never change after', async () => {
    const rabbiId1 = await createRabbi();
    const courseId1 = await insertCourse({ rabbiId: rabbiId1 });
    const cookie1 = await loginAsRabbi(rabbiId1);

    const firstClose = await app.inject({ method: 'POST', url: `/v1/rabbi/courses/${courseId1}/close`, headers: { cookie: cookie1 } });
    assert.equal(firstClose.statusCode, 200);
    const firstCloseBody = firstClose.json() as CourseResponse;
    if (firstCloseBody.lifecycle.status === 'closed') assert.equal(firstCloseBody.lifecycle.reason, 'closed');

    const secondClose = await app.inject({ method: 'POST', url: `/v1/rabbi/courses/${courseId1}/close`, headers: { cookie: cookie1 } });
    assert.equal(secondClose.statusCode, 409);
    const fullOnClosed = await app.inject({ method: 'POST', url: `/v1/rabbi/courses/${courseId1}/full`, headers: { cookie: cookie1 } });
    assert.equal(fullOnClosed.statusCode, 409);

    const rowAfter1 = await readCourseRow(courseId1);

    const rabbiId2 = await createRabbi();
    const courseId2 = await insertCourse({ rabbiId: rabbiId2 });
    const cookie2 = await loginAsRabbi(rabbiId2);

    const fullRes = await app.inject({ method: 'POST', url: `/v1/rabbi/courses/${courseId2}/full`, headers: { cookie: cookie2 } });
    assert.equal(fullRes.statusCode, 200);
    const fullBody = fullRes.json() as CourseResponse;
    if (fullBody.lifecycle.status === 'closed') assert.equal(fullBody.lifecycle.reason, 'full');

    const closeAfterFull = await app.inject({ method: 'POST', url: `/v1/rabbi/courses/${courseId2}/close`, headers: { cookie: cookie2 } });
    assert.equal(closeAfterFull.statusCode, 409);

    const rowAfter1Again = await readCourseRow(courseId1);
    assert.deepEqual(rowAfter1, rowAfter1Again);
  });

  // 11. Admin teacher shape.
  test('admin teacher shape: linked to unlinked, unknown rabbiId, and linking to a rabbanit with men', async () => {
    const cookie = await loginAsNewAdmin();
    const rabbiId = await createRabbi();
    const cityCode = await jerusalemCode();
    const courseId = await insertCourse({ rabbiId });

    const updateRes = await app.inject({
      method: 'PATCH',
      url: `/v1/admin/courses/${courseId}`,
      headers: { cookie },
      payload: { ...validCourseFields(cityCode), teacher: { kind: 'named', name: 'מורה חדש' } },
    });
    assert.equal(updateRes.statusCode, 200);
    const rowAfterUpdate = await readCourseRow(courseId);
    assert.equal(rowAfterUpdate?.rabbiId, null);

    const unknownRabbiRes = await app.inject({
      method: 'PATCH',
      url: `/v1/admin/courses/${courseId}`,
      headers: { cookie },
      payload: { ...validCourseFields(cityCode), teacher: { kind: 'rabbi', rabbiId: 'does-not-exist' } },
    });
    assert.equal(unknownRabbiRes.statusCode, 400);
    assert.equal(unknownRabbiRes.json().error, 'unknown_rabbi');

    const rabbanitId = await createRabbi('rabbanit');
    const rabbanitRes = await app.inject({
      method: 'PATCH',
      url: `/v1/admin/courses/${courseId}`,
      headers: { cookie },
      payload: { ...validCourseFields(cityCode, { audience: 'men' }), teacher: { kind: 'rabbi', rabbiId: rabbanitId } },
    });
    assert.equal(rabbanitRes.statusCode, 400);
    assert.equal(rabbanitRes.json().error, 'rabbanit_audience_must_be_women');
  });

  // 12. The four CHECKs.
  test('the four schema CHECKs each refuse a raw insert, naming the constraint that fired', async () => {
    const cityCode = await jerusalemCode();
    const base = {
      name: 'קורס',
      description: 'תיאור',
      openingDate: '2026-12-01',
      weeks: 10,
      sessions: 10,
      audience: 'men' as const,
      joinableAfterOpening: false,
      contactPhone: '0501234567',
      coverKey: 'test/cover.png',
    };

    const rabbiId = await createRabbi();
    const placeId = await createPlace();

    const rejectsWith = (values: Record<string, unknown>, constraintName: string) =>
      assert.rejects(
        () => db.insert(courses).values(values as typeof courses.$inferInsert),
        (error: unknown) => {
          const pgError = asPostgresError(error);
          assert.equal(pgError?.code, CHECK_VIOLATION);
          assert.equal(pgError?.constraint_name, constraintName);
          return true;
        },
      );

    await rejectsWith({ ...base, id: `test-course-${uniqueSuffix()}`, rabbiId, teacherName: 'שם', addressName: 'כתובת', addressStreet: 'רחוב', cityCode }, 'courses_teacher_shape');
    await rejectsWith({ ...base, id: `test-course-${uniqueSuffix()}`, rabbiId: null, teacherName: null, addressName: 'כתובת', addressStreet: 'רחוב', cityCode }, 'courses_teacher_shape');
    await rejectsWith({ ...base, id: `test-course-${uniqueSuffix()}`, teacherName: 'שם', placeId, addressName: 'כתובת', addressStreet: 'רחוב' }, 'courses_venue_shape');
    await rejectsWith({ ...base, id: `test-course-${uniqueSuffix()}`, teacherName: 'שם', placeId, cityCode }, 'courses_venue_no_city_code_on_place');
    await rejectsWith({ ...base, id: `test-course-${uniqueSuffix()}`, teacherName: 'שם', addressName: 'כתובת', addressStreet: 'רחוב', cityCode, topicOther: 'אחר' }, 'courses_topic_shape');
    await rejectsWith({ ...base, id: `test-course-${uniqueSuffix()}`, teacherName: 'שם', addressName: 'כתובת', addressStreet: 'רחוב', cityCode, topic: 'other' }, 'courses_topic_shape');
  });

  // 13. Rabbi cascade.
  test('the delete preview reports courseCount, and deleting cascades to courses and their photo rows', async () => {
    const cookie = await loginAsNewAdmin();
    const rabbiId = await createRabbi();
    const courseId = await insertCourse({ rabbiId });
    await insertCoursePhoto(courseId, 0);
    cleanupCourseIds.delete(courseId); // the cascade below removes it; do not double-delete in afterEach

    const previewRes = await app.inject({ method: 'GET', url: `/v1/admin/rabbis/${rabbiId}/delete-preview`, headers: { cookie } });
    assert.equal((previewRes.json() as { courseCount: number }).courseCount, 1);

    const noConfirmRes = await app.inject({ method: 'DELETE', url: `/v1/admin/rabbis/${rabbiId}`, headers: { cookie } });
    assert.equal(noConfirmRes.statusCode, 409);
    assert.equal(noConfirmRes.json().courseCount, 1);

    cleanupRabbiIds.delete(rabbiId); // the cascade below removes it too
    stubStorage();
    const confirmRes = await app.inject({ method: 'DELETE', url: `/v1/admin/rabbis/${rabbiId}?confirm=true`, headers: { cookie } });
    assert.equal(confirmRes.statusCode, 204);

    assert.equal(await readCourseRow(courseId), undefined);
    const photosAfter = await db.select().from(coursePhotos).where(eq(coursePhotos.courseId, courseId));
    assert.equal(photosAfter.length, 0);
  });

  // 14. A closed course is read-only.
  test('a closed course (by hand and by the calendar) refuses every write but delete', async () => {
    const today = todayInIsrael(new Date());
    const cityCode = await jerusalemCode();

    const byHandRabbiId = await createRabbi();
    const byHandCourseId = await insertCourse({ rabbiId: byHandRabbiId });
    const byHandCookie = await loginAsRabbi(byHandRabbiId);
    const closeRes = await app.inject({ method: 'POST', url: `/v1/rabbi/courses/${byHandCourseId}/close`, headers: { cookie: byHandCookie } });
    assert.equal(closeRes.statusCode, 200);

    const byCalendarRabbiId = await createRabbi();
    const byCalendarCourseId = await insertCourse({ rabbiId: byCalendarRabbiId, openingDate: today, joinableAfterOpening: false });
    const byCalendarCookie = await loginAsRabbi(byCalendarRabbiId);

    for (const [courseId, cookie] of [
      [byHandCourseId, byHandCookie],
      [byCalendarCourseId, byCalendarCookie],
    ] as const) {
      const before = await readCourseRow(courseId);
      const photosBefore = await db.select().from(coursePhotos).where(eq(coursePhotos.courseId, courseId));

      const patchRes = await app.inject({ method: 'PATCH', url: `/v1/rabbi/courses/${courseId}`, headers: { cookie }, payload: validCourseFields(cityCode) });
      assert.equal(patchRes.statusCode, 409);
      assert.equal(patchRes.json().error, 'course_closed');

      stubStorage();
      const coverRes = await app.inject({ method: 'POST', url: `/v1/rabbi/courses/${courseId}/cover`, headers: { cookie }, payload: singleFileBody(buildPngBytes(600, 600)) });
      assert.equal(coverRes.statusCode, 409);

      const photoRes = await app.inject({ method: 'POST', url: `/v1/rabbi/courses/${courseId}/photos`, headers: { cookie }, payload: singleFileBody(buildPngBytes(600, 600)) });
      assert.equal(photoRes.statusCode, 409);
      assert.equal(putCallCount(), 0, 'no storage.put on a refused write');
      mock.restoreAll();

      assert.deepEqual(await readCourseRow(courseId), before);
      assert.deepEqual(await db.select().from(coursePhotos).where(eq(coursePhotos.courseId, courseId)), photosBefore);

      const deleteRes = await app.inject({ method: 'DELETE', url: `/v1/rabbi/courses/${courseId}`, headers: { cookie } });
      assert.equal(deleteRes.statusCode, 204);
      cleanupCourseIds.delete(courseId);
    }
  });

  // 15. Duplicate carries everything and owns its objects.
  test('duplicating a closed course copies its cover and gallery as new objects, and leaves the source untouched', async () => {
    const rabbiId = await createRabbi();
    const courseId = await insertCourse({ rabbiId });
    await insertCoursePhoto(courseId, 0);
    await insertCoursePhoto(courseId, 1);
    const cookie = await loginAsRabbi(rabbiId);

    await app.inject({ method: 'POST', url: `/v1/rabbi/courses/${courseId}/close`, headers: { cookie } });
    const sourceBefore = await readCourseRow(courseId);
    const sourcePhotosBefore = await db.select().from(coursePhotos).where(eq(coursePhotos.courseId, courseId));

    stubStorage();
    const today = todayInIsrael(new Date());
    const dupRes = await app.inject({
      method: 'POST',
      url: `/v1/rabbi/courses/${courseId}/duplicate`,
      headers: { cookie },
      payload: { openingDate: addDays(today, 30), cycle: 2 },
    });
    assert.equal(dupRes.statusCode, 201);
    const dupBody = dupRes.json() as CourseResponse;
    cleanupCourseIds.add(dupBody.id);

    assert.notEqual(dupBody.id, courseId);
    assert.equal(dupBody.cycle, 2);
    assert.equal(dupBody.openingDate, addDays(today, 30));
    assert.equal(dupBody.lifecycle.status === 'closed', false);

    const newRow = await readCourseRow(dupBody.id);
    const newPhotos = await db.select().from(coursePhotos).where(eq(coursePhotos.courseId, dupBody.id));
    assert.equal(newPhotos.length, 2);
    assert.deepEqual(newPhotos.map((p) => p.position).sort(), [0, 1]);

    const newKeys = [newRow?.coverKey, ...newPhotos.map((p) => p.storageKey)];
    assert.equal(new Set(newKeys).size, 3, 'three distinct keys');
    for (const key of newKeys) assert.ok(key?.startsWith(`courses/${dupBody.id}/`));

    const copyMock = (storage.copy as unknown as { mock: { callCount: () => number } }).mock;
    assert.equal(copyMock.callCount(), 3);

    assert.deepEqual(await readCourseRow(courseId), sourceBefore);
    assert.deepEqual(await db.select().from(coursePhotos).where(eq(coursePhotos.courseId, courseId)), sourcePhotosBefore);
  });

  // 16. Duplicate refused.
  test('duplicate is refused on an open course, and on an opening date of today', async () => {
    const rabbiId = await createRabbi();
    const openCourseId = await insertCourse({ rabbiId });
    const cookie = await loginAsRabbi(rabbiId);

    stubStorage();
    const notClosedRes = await app.inject({
      method: 'POST',
      url: `/v1/rabbi/courses/${openCourseId}/duplicate`,
      headers: { cookie },
      payload: { openingDate: addDays(todayInIsrael(new Date()), 30) },
    });
    assert.equal(notClosedRes.statusCode, 409);
    assert.equal(notClosedRes.json().error, 'course_not_closed');
    assert.equal((storage.copy as unknown as { mock: { callCount: () => number } }).mock.callCount(), 0);

    await app.inject({ method: 'POST', url: `/v1/rabbi/courses/${openCourseId}/close`, headers: { cookie } });
    const todayRes = await app.inject({
      method: 'POST',
      url: `/v1/rabbi/courses/${openCourseId}/duplicate`,
      headers: { cookie },
      payload: { openingDate: todayInIsrael(new Date()) },
    });
    assert.equal(todayRes.statusCode, 400);
    assert.equal(todayRes.json().error, 'opening_date_not_future');
  });

  // 17. Multipart create succeeds.
  test('multipart create persists the JSON fields, with the cover key under courses/<id>/', async () => {
    const rabbiId = await createRabbi();
    const cookie = await loginAsRabbi(rabbiId);
    const cityCode = await jerusalemCode();

    stubStorage();
    const res = await app.inject({ method: 'POST', url: '/v1/rabbi/courses', headers: { cookie }, payload: multipartBody(validCourseFields(cityCode, { name: 'קורס חדש' })) });
    assert.equal(res.statusCode, 201);
    const body = res.json() as CourseResponse;
    cleanupCourseIds.add(body.id);
    assert.equal(body.name, 'קורס חדש');

    const row = await readCourseRow(body.id);
    assert.ok(row?.coverKey.startsWith(`courses/${body.id}/`));

    const malformedRes = await app.inject({
      method: 'POST',
      url: '/v1/rabbi/courses',
      headers: { cookie },
      payload: (() => {
        const form = new FormData();
        form.append('course', '{not json');
        form.append('cover', new Blob([toBlobPart(buildPngBytes(600, 600))], { type: 'image/png' }), 'cover.png');
        return form;
      })(),
    });
    assert.equal(malformedRes.statusCode, 400);

    const noCoverRes = await app.inject({
      method: 'POST',
      url: '/v1/rabbi/courses',
      headers: { cookie },
      payload: (() => {
        const form = new FormData();
        form.append('course', JSON.stringify(validCourseFields(cityCode)));
        return form;
      })(),
    });
    assert.equal(noCoverRes.statusCode, 400);
    assert.equal(noCoverRes.json().error, 'cover_required');
    assert.equal(putCallCount(), 1, 'only the first, successful create ever called put');
  });

  // 18. No course is saved already closed.
  test('PATCHing an open, non-joinable course to an opening date of yesterday is refused', async () => {
    const rabbiId = await createRabbi();
    const courseId = await insertCourse({ rabbiId, joinableAfterOpening: false });
    const cookie = await loginAsRabbi(rabbiId);
    const cityCode = await jerusalemCode();
    const before = await readCourseRow(courseId);

    const res = await app.inject({
      method: 'PATCH',
      url: `/v1/rabbi/courses/${courseId}`,
      headers: { cookie },
      payload: validCourseFields(cityCode, { openingDate: addDays(todayInIsrael(new Date()), -1), joinableAfterOpening: false }),
    });
    assert.equal(res.statusCode, 400);
    assert.equal(res.json().error, 'course_would_be_closed');
    assert.deepEqual(await readCourseRow(courseId), before);
  });

  // 19. Admin list filters and order.
  test('the admin list filters by status, by rabbiId and by q, and orders not-closed before closed', async () => {
    const cookie = await loginAsNewAdmin();
    const rabbiA = await createRabbi();
    const rabbiB = await createRabbi();
    const today = todayInIsrael(new Date());

    const openCourse = await insertCourse({ rabbiId: rabbiA, name: `קורס פתוח ${uniqueSuffix()}`, openingDate: addDays(today, 10) });
    const closedCourse = await insertCourse({ rabbiId: rabbiA, openingDate: addDays(today, -6), joinableAfterOpening: false });
    const otherRabbiCourse = await insertCourse({ rabbiId: rabbiB, openingDate: addDays(today, 10) });

    const statusRes = await app.inject({ method: 'GET', url: '/v1/admin/courses?status=closed', headers: { cookie } });
    const statusIds = (statusRes.json() as { items: CourseResponse[] }).items.map((i) => i.id);
    assert.ok(statusIds.includes(closedCourse));
    assert.ok(!statusIds.includes(openCourse));

    const rabbiRes = await app.inject({ method: 'GET', url: `/v1/admin/courses?rabbiId=${rabbiA}`, headers: { cookie } });
    const rabbiIds = (rabbiRes.json() as { items: CourseResponse[] }).items.map((i) => i.id);
    assert.ok(rabbiIds.includes(openCourse));
    assert.ok(rabbiIds.includes(closedCourse));
    assert.ok(!rabbiIds.includes(otherRabbiCourse));

    const qRes = await app.inject({ method: 'GET', url: `/v1/admin/courses?q=${encodeURIComponent('קורס פתוח')}`, headers: { cookie } });
    const qIds = (qRes.json() as { items: CourseResponse[] }).items.map((i) => i.id);
    assert.ok(qIds.includes(openCourse));

    const allRes = await app.inject({ method: 'GET', url: `/v1/admin/courses?rabbiId=${rabbiA}&pageSize=50`, headers: { cookie } });
    const allItems = (allRes.json() as { items: CourseResponse[] }).items;
    const openIndex = allItems.findIndex((i) => i.id === openCourse);
    const closedIndex = allItems.findIndex((i) => i.id === closedCourse);
    assert.ok(openIndex < closedIndex, 'not-closed courses sort before closed ones');
  });
});
