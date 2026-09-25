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
import { COURSE_GALLERY_MAX_PHOTOS } from '../src/service/course/consts';
import { addDays, todayInIsrael } from '../src/service/lesson/israel-time';
import storage from '../src/storage/storage';
import { assertDatabaseReachable, buildCourseTestApp, rawClient } from './app-harness';

const SEEDED_CITY_NAME = 'ירושלים';
const uniqueSuffix = (): string => nanoid(8);
const TEST_CONTACT_PHONE = '0501234567';

// Mirrors `invariants.test.ts`'s own unwrap: drizzle-orm's postgres-js
// driver wraps the real `PostgresError` (with its SQLSTATE `code` and, for
// a CHECK violation, `constraint_name`) on `.cause`, not on the thrown
// error itself.
const asPostgresError = (error: unknown): postgres.PostgresError | undefined => {
  const cause = error instanceof Error ? error.cause : undefined;
  return cause instanceof postgres.PostgresError ? cause : undefined;
};
const CHECK_VIOLATION = '23514';

// Thrown to force a rollback when a raw insert a CHECK should have refused
// is wrongly accepted: without it the row would commit and outlive the
// test, the way three `test-course-*` rows once sat in the owner's local
// database and blocked `ADD CONSTRAINT courses_topic_shape` until he
// deleted them by hand.
class UnexpectedInsertSuccess extends Error {}

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
      openingDate: fixture.openingDate ?? addDays(todayInIsrael(new Date()), 60),
      weeks: fixture.weeks ?? 10,
      sessions: 10,
      placeId,
      addressName: placeId ? null : 'בניין בדיקה',
      addressStreet: placeId ? null : 'רחוב הבדיקה 1',
      cityCode,
      audience: fixture.audience ?? 'men',
      joinableAfterOpening: fixture.joinableAfterOpening ?? false,
      contactPhone: TEST_CONTACT_PHONE,
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
    openingDate: addDays(todayInIsrael(new Date()), 60),
    weeks: 10,
    sessions: 10,
    venue: { kind: 'address', name: 'בניין בדיקה', street: 'רחוב 1', cityCode },
    audience: 'men',
    joinableAfterOpening: false,
    contactPhone: TEST_CONTACT_PHONE,
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

  // The courses table is the real, shared, seeded database, never emptied
  // for this suite: every home-row assertion below reads the ids of its own
  // fixtures out of whatever row comes back, rather than assuming the row,
  // or the table, starts empty.
  const courseRowIds = (body: HomeResponse): string[] => {
    const row = body.rows.find((r) => r.kind === 'courses');
    return row && row.kind === 'courses' ? row.items.map((item) => item.id) : [];
  };

  // 1. Course page. The no-listed-course-gives-no-row case is proven, for
  // real, by the pure `placeCourseRow` suite (`test/home-rows.test.ts`):
  // this shared database is never empty, so a "before it exists" half here
  // could never fail, and its "after" half only repeated test 3 below.
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
    const goneBodyJson = JSON.stringify(goneBody);
    assert.ok(!goneBodyJson.includes('contactPhone'));
    assert.ok(!goneBodyJson.includes(TEST_CONTACT_PHONE), 'the phone number itself must not leak under any other key either');
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
    // Non-joinable, so it closes on its own opening day: opening today means
    // it is already closed today, just still inside its own closed week.
    const openingToday = await insertCourse({ openingDate: today, joinableAfterOpening: false });
    const closedSixDaysAgo = await insertCourse({ openingDate: addDays(today, -6), joinableAfterOpening: false });
    const gone = await insertCourse({ openingDate: addDays(today, -7), joinableAfterOpening: false });
    const womensCourse = await insertCourse({ openingDate: addDays(today, 10), audience: 'women' }); // out of general scope

    const res = await app.inject({ method: 'GET', url: '/v1/home' });
    assert.equal(res.statusCode, 200);
    const body = res.json() as HomeResponse;

    assert.equal(body.rows[0]?.kind, 'lessons');
    assert.equal(body.rows[1]?.kind, 'courses');
    assert.equal(body.rows.filter((row) => row.kind === 'courses').length, 1);

    const courseRow = body.rows[1];
    if (!courseRow || courseRow.kind !== 'courses') throw new Error('expected a course row');
    assert.equal('womensAreaTileIndex' in courseRow, false);

    const allIds = courseRow.items.map((item) => item.id);
    assert.ok(!allIds.includes(gone));
    assert.ok(!allIds.includes(womensCourse));

    // Every other course in the shared, seeded database sits somewhere in
    // this row too; filtering down to this suite's own fixtures proves the
    // order among them without assuming the row holds nothing else.
    const suiteIds = new Set([farFuture, openJoinable, openingToday, closedSixDaysAgo]);
    const orderedSuiteIds = allIds.filter((id) => suiteIds.has(id));
    assert.deepEqual(orderedSuiteIds, [openJoinable, farFuture, closedSixDaysAgo, openingToday]);

    const lessonRows = body.rows.filter((row) => row.kind === 'lessons');
    for (const row of lessonRows) assert.ok(row.items.every((item) => typeof item.lessonId === 'string'));
  });

  // 3. A single listed course sends the row.
  test('a single listed course still sends the row (no minimum of 3 applied to courses)', async () => {
    const courseId = await insertCourse();
    const res = await app.inject({ method: 'GET', url: '/v1/home' });
    const body = res.json() as HomeResponse;
    assert.ok(courseRowIds(body).includes(courseId), 'one listed course is enough to send the row and be in it, unlike a lesson row');
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
    const homeCourseIds = courseRowIds(homeBody);
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
    const goneRavCourse = await insertCourse({ rabbiId: ravId, openingDate: addDays(today, -7), joinableAfterOpening: false });
    const gonePlaceCourse = await insertCourse({ placeId, openingDate: addDays(today, -7), joinableAfterOpening: false });

    const [rabbiRes, placeRes] = await Promise.all([
      app.inject({ method: 'GET', url: `/v1/rabbis/${ravId}` }),
      app.inject({ method: 'GET', url: `/v1/places/${placeId}` }),
    ]);
    const rabbiBody = rabbiRes.json() as RabbiDetailResponse;
    const placeBody = placeRes.json() as PlaceDetailResponse;

    assert.ok(rabbiBody.courses.map((c) => c.id).includes(generalCourse));
    assert.ok(!rabbiBody.courses.map((c) => c.id).includes(goneRavCourse));
    assert.ok(placeBody.courses.map((c) => c.id).includes(placeCourse));
    assert.ok(!placeBody.courses.map((c) => c.id).includes(addressCourse));
    assert.ok(!placeBody.courses.map((c) => c.id).includes(gonePlaceCourse));
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
    const unknownRes = await app.inject({ method: 'GET', url: '/v1/rabbi/courses/does-not-exist', headers: { cookie: cookieB } });
    assert.equal(unknownRes.statusCode, 404);

    const getRes = await app.inject({ method: 'GET', url: `/v1/rabbi/courses/${courseId}`, headers: { cookie: cookieB } });
    assert.equal(getRes.statusCode, 404);
    assert.deepEqual(getRes.json(), unknownRes.json(), "rabbi A's course must read exactly like an unknown id to rabbi B");

    const patchRes = await app.inject({ method: 'PATCH', url: `/v1/rabbi/courses/${courseId}`, headers: { cookie: cookieB }, payload: validCourseFields(cityCode) });
    assert.equal(patchRes.statusCode, 404);

    const closeRes = await app.inject({ method: 'POST', url: `/v1/rabbi/courses/${courseId}/close`, headers: { cookie: cookieB } });
    assert.equal(closeRes.statusCode, 404);

    const duplicateRes = await app.inject({
      method: 'POST',
      url: `/v1/rabbi/courses/${courseId}/duplicate`,
      headers: { cookie: cookieB },
      payload: { openingDate: addDays(todayInIsrael(new Date()), 30) },
    });
    assert.equal(duplicateRes.statusCode, 404);

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
    assert.deepEqual(patchRes.json().details, { audience: 'men' });
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
    assert.deepEqual(createRes.json().details, { audience: 'men' });
    assert.equal(putCallCount(), 0, 'the guard must run before storage.put');
  });

  // 9. Photo cap. A photo of any size is accepted (the owner's call at his
  // hand run): the client warns about blur before upload instead of the
  // server refusing, so there is no floor left to test here.
  test('the gallery cap refuses before storage.put is ever called', async () => {
    const rabbiId = await createRabbi();
    const linkedCourseId = await insertCourse({ rabbiId });
    for (let position = 0; position < COURSE_GALLERY_MAX_PHOTOS; position += 1) await insertCoursePhoto(linkedCourseId, position);
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
    assert.deepEqual(capRes.json().details, { max: COURSE_GALLERY_MAX_PHOTOS });
    const photosAfterCap = await db.select().from(coursePhotos).where(eq(coursePhotos.courseId, linkedCourseId));
    assert.equal(photosAfterCap.length, COURSE_GALLERY_MAX_PHOTOS);
    assert.equal(putCallCount(), 0);
  });

  // A course photo of any size is accepted: a tiny cover and a tiny gallery
  // photo both succeed.
  test('a cover and a gallery photo well under the old floor are both accepted', async () => {
    const rabbiId = await createRabbi();
    const courseId = await insertCourse({ rabbiId });
    const cookie = await loginAsRabbi(rabbiId);
    const tinyPng = buildPngBytes(10, 10);

    stubStorage();
    const coverRes = await app.inject({ method: 'POST', url: `/v1/rabbi/courses/${courseId}/cover`, headers: { cookie }, payload: singleFileBody(tinyPng) });
    assert.equal(coverRes.statusCode, 200);

    const photoRes = await app.inject({ method: 'POST', url: `/v1/rabbi/courses/${courseId}/photos`, headers: { cookie }, payload: singleFileBody(tinyPng) });
    assert.equal(photoRes.statusCode, 201);
  });

  // 10. Close and full are final.
  test('close and full are each final, and the columns never change after', async () => {
    const rabbiId1 = await createRabbi();
    const courseId1 = await insertCourse({ rabbiId: rabbiId1 });
    const cookie1 = await loginAsRabbi(rabbiId1);

    const firstClose = await app.inject({ method: 'POST', url: `/v1/rabbi/courses/${courseId1}/close`, headers: { cookie: cookie1 } });
    assert.equal(firstClose.statusCode, 200);
    const firstCloseBody = firstClose.json() as CourseResponse;
    assert.equal(firstCloseBody.lifecycle.status, 'closed');
    if (firstCloseBody.lifecycle.status === 'closed') assert.equal(firstCloseBody.lifecycle.reason, 'closed');
    const rowAfterFirstClose1 = await readCourseRow(courseId1);

    const secondClose = await app.inject({ method: 'POST', url: `/v1/rabbi/courses/${courseId1}/close`, headers: { cookie: cookie1 } });
    assert.equal(secondClose.statusCode, 409);
    assert.deepEqual(await readCourseRow(courseId1), rowAfterFirstClose1);

    const fullOnClosed = await app.inject({ method: 'POST', url: `/v1/rabbi/courses/${courseId1}/full`, headers: { cookie: cookie1 } });
    assert.equal(fullOnClosed.statusCode, 409);
    assert.deepEqual(await readCourseRow(courseId1), rowAfterFirstClose1);

    const rabbiId2 = await createRabbi();
    const courseId2 = await insertCourse({ rabbiId: rabbiId2 });
    const cookie2 = await loginAsRabbi(rabbiId2);

    const fullRes = await app.inject({ method: 'POST', url: `/v1/rabbi/courses/${courseId2}/full`, headers: { cookie: cookie2 } });
    assert.equal(fullRes.statusCode, 200);
    const fullBody = fullRes.json() as CourseResponse;
    assert.equal(fullBody.lifecycle.status, 'closed');
    if (fullBody.lifecycle.status === 'closed') assert.equal(fullBody.lifecycle.reason, 'full');
    const rowAfterFull2 = await readCourseRow(courseId2);

    const closeAfterFull = await app.inject({ method: 'POST', url: `/v1/rabbi/courses/${courseId2}/close`, headers: { cookie: cookie2 } });
    assert.equal(closeAfterFull.statusCode, 409);
    assert.deepEqual(await readCourseRow(courseId2), rowAfterFull2);
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
    assert.deepEqual(rabbanitRes.json().details, { audience: 'men' });
  });

  // 12. The five CHECKs.
  test('the five schema CHECKs each refuse a raw insert, naming the constraint that fired', async () => {
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

    // Runs the insert inside a transaction that always rolls back: a
    // genuine CHECK violation aborts it on its own, and a wrongly accepted
    // row forces the same rollback via `UnexpectedInsertSuccess`, so
    // neither ever survives to block a later migration the way it once did.
    const rejectsWith = async (values: Record<string, unknown>, constraintName: string): Promise<void> => {
      let capturedError: unknown;
      try {
        await db.transaction(async (tx) => {
          await tx.insert(courses).values(values as typeof courses.$inferInsert);
          throw new UnexpectedInsertSuccess();
        });
      } catch (error) {
        capturedError = error;
      }

      if (capturedError instanceof UnexpectedInsertSuccess) {
        assert.fail(`expected constraint '${constraintName}' to refuse this row, but it was accepted`);
      }

      const pgError = asPostgresError(capturedError);
      assert.equal(pgError?.code, CHECK_VIOLATION);
      assert.equal(pgError?.constraint_name, constraintName);
    };

    await rejectsWith({ ...base, id: `test-course-${uniqueSuffix()}`, rabbiId, teacherName: 'שם', addressName: 'כתובת', addressStreet: 'רחוב', cityCode }, 'courses_teacher_shape');
    await rejectsWith({ ...base, id: `test-course-${uniqueSuffix()}`, rabbiId: null, teacherName: null, addressName: 'כתובת', addressStreet: 'רחוב', cityCode }, 'courses_teacher_shape');
    await rejectsWith({ ...base, id: `test-course-${uniqueSuffix()}`, teacherName: 'שם', placeId, addressName: 'כתובת', addressStreet: 'רחוב' }, 'courses_venue_shape');
    await rejectsWith({ ...base, id: `test-course-${uniqueSuffix()}`, teacherName: 'שם', placeId, cityCode }, 'courses_venue_no_city_code_on_place');
    await rejectsWith({ ...base, id: `test-course-${uniqueSuffix()}`, teacherName: 'שם', addressName: 'כתובת', addressStreet: 'רחוב', cityCode, topicOther: 'אחר' }, 'courses_topic_shape');
    await rejectsWith({ ...base, id: `test-course-${uniqueSuffix()}`, teacherName: 'שם', addressName: 'כתובת', addressStreet: 'רחוב', cityCode, topic: 'other' }, 'courses_topic_shape');
    await rejectsWith(
      { ...base, id: `test-course-${uniqueSuffix()}`, teacherName: 'שם', addressName: 'כתובת', addressStreet: 'רחוב', cityCode, registrationClosedAt: new Date(), closeReason: null },
      'courses_close_shape',
    );
    await rejectsWith(
      { ...base, id: `test-course-${uniqueSuffix()}`, teacherName: 'שם', addressName: 'כתובת', addressStreet: 'רחוב', cityCode, registrationClosedAt: null, closeReason: 'closed' },
      'courses_close_shape',
    );
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
      assert.equal(patchRes.json().details.reason, 'closed');

      stubStorage();
      const coverRes = await app.inject({ method: 'POST', url: `/v1/rabbi/courses/${courseId}/cover`, headers: { cookie }, payload: singleFileBody(buildPngBytes(600, 600)) });
      assert.equal(coverRes.statusCode, 409);
      assert.equal(coverRes.json().error, 'course_closed');
      assert.equal(coverRes.json().details.reason, 'closed');

      const photoRes = await app.inject({ method: 'POST', url: `/v1/rabbi/courses/${courseId}/photos`, headers: { cookie }, payload: singleFileBody(buildPngBytes(600, 600)) });
      assert.equal(photoRes.statusCode, 409);
      assert.equal(photoRes.json().error, 'course_closed');
      assert.equal(photoRes.json().details.reason, 'closed');
      assert.equal(putCallCount(), 0, 'no storage.put on a refused write');

      const deletePhotoRes = await app.inject({ method: 'DELETE', url: `/v1/rabbi/courses/${courseId}/photos/does-not-matter`, headers: { cookie } });
      assert.equal(deletePhotoRes.statusCode, 409);
      assert.equal(deletePhotoRes.json().error, 'course_closed');
      assert.equal(deletePhotoRes.json().details.reason, 'closed');

      assert.deepEqual(await readCourseRow(courseId), before);
      assert.deepEqual(await db.select().from(coursePhotos).where(eq(coursePhotos.courseId, courseId)), photosBefore);

      // The stub stays installed through this delete: it is the real write
      // this closed course still allows, and it does call `storage.remove`.
      const deleteRes = await app.inject({ method: 'DELETE', url: `/v1/rabbi/courses/${courseId}`, headers: { cookie } });
      assert.equal(deleteRes.statusCode, 204);
      cleanupCourseIds.delete(courseId);
      mock.restoreAll();
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

    if (!sourceBefore) throw new Error('expected the source course row to exist');

    const newRow = await readCourseRow(dupBody.id);
    if (!newRow) throw new Error('expected the duplicated course row to exist');
    const newPhotos = await db.select().from(coursePhotos).where(eq(coursePhotos.courseId, dupBody.id));
    assert.equal(newPhotos.length, 2);
    assert.deepEqual(newPhotos.map((p) => p.position).sort(), [0, 1]);

    // Everything but the id, the cycle, the opening date, the cover key and
    // the (reset) close state is a plain copy of the source's own columns.
    const copiedFields = [
      'name',
      'description',
      'rabbiId',
      'teacherName',
      'weeks',
      'sessions',
      'hours',
      'placeId',
      'addressName',
      'addressStreet',
      'addressFloor',
      'cityCode',
      'audience',
      'topic',
      'topicOther',
      'joinableAfterOpening',
      'contactPhone',
      'priceShekels',
    ] as const;
    for (const field of copiedFields) assert.equal(newRow[field], sourceBefore[field], `expected '${field}' to carry over from the source course`);

    const newKeys = [newRow.coverKey, ...newPhotos.map((p) => p.storageKey)];
    assert.equal(new Set(newKeys).size, 3, 'three distinct keys');
    for (const key of newKeys) assert.ok(key.startsWith(`courses/${dupBody.id}/`));

    const copyMock = (storage.copy as unknown as { mock: { callCount: () => number; calls: { arguments: unknown[] }[] } }).mock;
    assert.equal(copyMock.callCount(), 3);
    const copiedSourceKeys = copyMock.calls.map((call) => call.arguments[0]);
    assert.deepEqual(new Set(copiedSourceKeys), new Set([sourceBefore.coverKey, ...sourcePhotosBefore.map((p) => p.storageKey)]));

    assert.deepEqual(await readCourseRow(courseId), sourceBefore);
    assert.deepEqual(await db.select().from(coursePhotos).where(eq(coursePhotos.courseId, courseId)), sourcePhotosBefore);
  });

  // 16. Duplicate refused.
  test('duplicate is refused on an open course, and on an opening date of today, creating no row either time', async () => {
    const rabbiId = await createRabbi();
    const openCourseId = await insertCourse({ rabbiId });
    const cookie = await loginAsRabbi(rabbiId);
    const courseCount = async (): Promise<number> => (await db.select({ id: courses.id }).from(courses)).length;
    const countBefore = await courseCount();

    stubStorage();
    const notClosedRes = await app.inject({
      method: 'POST',
      url: `/v1/rabbi/courses/${openCourseId}/duplicate`,
      headers: { cookie },
      payload: { openingDate: addDays(todayInIsrael(new Date()), 30) },
    });
    assert.equal(notClosedRes.statusCode, 409);
    assert.equal(notClosedRes.json().error, 'course_not_closed');
    assert.deepEqual(notClosedRes.json().details, { courseName: 'קורס בדיקה' });
    assert.equal((storage.copy as unknown as { mock: { callCount: () => number } }).mock.callCount(), 0);
    assert.equal(await courseCount(), countBefore, 'a refused duplicate creates no row');

    await app.inject({ method: 'POST', url: `/v1/rabbi/courses/${openCourseId}/close`, headers: { cookie } });
    const todayOpeningDate = todayInIsrael(new Date());
    const todayRes = await app.inject({
      method: 'POST',
      url: `/v1/rabbi/courses/${openCourseId}/duplicate`,
      headers: { cookie },
      payload: { openingDate: todayOpeningDate },
    });
    assert.equal(todayRes.statusCode, 400);
    assert.equal(todayRes.json().error, 'opening_date_not_future');
    assert.deepEqual(todayRes.json().details, { openingDate: todayOpeningDate });
    assert.equal(await courseCount(), countBefore, 'a refused duplicate creates no row');
  });

  test('admin duplicate of a free-text-teacher course carries the name over, still unlinked to any rabbi', async () => {
    const cookie = await loginAsNewAdmin();
    const courseId = await insertCourse({ teacherName: 'מורה עצמאי' });

    await app.inject({ method: 'POST', url: `/v1/admin/courses/${courseId}/close`, headers: { cookie } });

    stubStorage();
    const dupRes = await app.inject({
      method: 'POST',
      url: `/v1/admin/courses/${courseId}/duplicate`,
      headers: { cookie },
      payload: { openingDate: addDays(todayInIsrael(new Date()), 30) },
    });
    assert.equal(dupRes.statusCode, 201);
    const dupBody = dupRes.json() as CourseResponse;
    cleanupCourseIds.add(dupBody.id);

    assert.deepEqual(dupBody.teacher, { kind: 'named', name: 'מורה עצמאי' });
    const newRow = await readCourseRow(dupBody.id);
    assert.equal(newRow?.rabbiId, null);
    assert.equal(newRow?.teacherName, 'מורה עצמאי');
  });

  // 17. Multipart create succeeds, with a cover well under the old floor.
  test('multipart create persists the JSON fields, with the cover key under courses/<id>/', async () => {
    const rabbiId = await createRabbi();
    const cookie = await loginAsRabbi(rabbiId);
    const cityCode = await jerusalemCode();

    stubStorage();
    const res = await app.inject({
      method: 'POST',
      url: '/v1/rabbi/courses',
      headers: { cookie },
      payload: multipartBody(validCourseFields(cityCode, { name: 'קורס חדש' }), buildPngBytes(10, 10)),
    });
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
    assert.deepEqual(noCoverRes.json().details, {});
    assert.equal(putCallCount(), 1, 'only the first, successful create ever called put');
  });

  test('a second file part on a multipart create answers too_many_files', async () => {
    const rabbiId = await createRabbi();
    const cookie = await loginAsRabbi(rabbiId);
    const cityCode = await jerusalemCode();

    const form = new FormData();
    form.append('course', JSON.stringify(validCourseFields(cityCode)));
    form.append('cover', new Blob([toBlobPart(buildPngBytes(600, 600))], { type: 'image/png' }), 'cover-1.png');
    form.append('cover', new Blob([toBlobPart(buildPngBytes(600, 600))], { type: 'image/png' }), 'cover-2.png');

    const res = await app.inject({ method: 'POST', url: '/v1/rabbi/courses', headers: { cookie }, payload: form });
    assert.equal(res.statusCode, 413);
    assert.equal(res.json().error, 'too_many_files');
  });

  // 18. No course is saved already closed.
  test('PATCHing an open, non-joinable course to an opening date of yesterday is refused', async () => {
    const rabbiId = await createRabbi();
    const courseId = await insertCourse({ rabbiId, joinableAfterOpening: false });
    const cookie = await loginAsRabbi(rabbiId);
    const cityCode = await jerusalemCode();
    const before = await readCourseRow(courseId);

    const yesterday = addDays(todayInIsrael(new Date()), -1);
    const res = await app.inject({
      method: 'PATCH',
      url: `/v1/rabbi/courses/${courseId}`,
      headers: { cookie },
      payload: validCourseFields(cityCode, { openingDate: yesterday, joinableAfterOpening: false }),
    });
    assert.equal(res.statusCode, 400);
    assert.equal(res.json().error, 'course_would_be_closed');
    assert.deepEqual(res.json().details, { openingDate: yesterday });
    assert.deepEqual(await readCourseRow(courseId), before);
  });

  // 19. Admin list filters and order.
  test('the admin list filters by status (open, full, closed), by rabbiId and by q, and orders not-closed before closed', async () => {
    const cookie = await loginAsNewAdmin();
    const rabbiA = await createRabbi();
    const rabbiB = await createRabbi();
    const today = todayInIsrael(new Date());

    const openCourse = await insertCourse({ rabbiId: rabbiA, name: `קורס פתוח ${uniqueSuffix()}`, openingDate: addDays(today, 10) });
    // Closed by the calendar (non-joinable, opened 6 days ago): the
    // calendar close carries no reason and always reads 'closed'.
    const closedCourse = await insertCourse({ rabbiId: rabbiA, openingDate: addDays(today, -6), joinableAfterOpening: false });
    // Closed by hand and marked full: joinable with `weeks` chosen so the
    // calendar's own auto-close lands long after the manual one, so the
    // manual close (and its 'full' reason) is what actually determines the
    // status here, not the calendar racing ahead of it.
    const fullCourse = await insertCourse({
      rabbiId: rabbiA,
      openingDate: addDays(today, -60),
      weeks: 20,
      joinableAfterOpening: true,
      registrationClosedAt: new Date(`${addDays(today, -3)}T12:00:00.000Z`),
      closeReason: 'full',
    });
    const otherRabbiCourse = await insertCourse({ rabbiId: rabbiB, openingDate: addDays(today, 10) });

    const openStatusRes = await app.inject({ method: 'GET', url: '/v1/admin/courses?status=open', headers: { cookie } });
    const openStatusIds = (openStatusRes.json() as { items: CourseResponse[] }).items.map((i) => i.id);
    assert.ok(openStatusIds.includes(openCourse));
    assert.ok(!openStatusIds.includes(closedCourse));
    assert.ok(!openStatusIds.includes(fullCourse));

    const closedStatusRes = await app.inject({ method: 'GET', url: '/v1/admin/courses?status=closed', headers: { cookie } });
    const closedStatusIds = (closedStatusRes.json() as { items: CourseResponse[] }).items.map((i) => i.id);
    assert.ok(closedStatusIds.includes(closedCourse));
    assert.ok(!closedStatusIds.includes(openCourse));
    assert.ok(!closedStatusIds.includes(fullCourse));

    const fullStatusRes = await app.inject({ method: 'GET', url: '/v1/admin/courses?status=full', headers: { cookie } });
    const fullStatusIds = (fullStatusRes.json() as { items: CourseResponse[] }).items.map((i) => i.id);
    assert.ok(fullStatusIds.includes(fullCourse));
    assert.ok(!fullStatusIds.includes(openCourse));
    assert.ok(!fullStatusIds.includes(closedCourse));

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
