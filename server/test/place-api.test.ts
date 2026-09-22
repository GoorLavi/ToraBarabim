import assert from 'node:assert/strict';
import { after, afterEach, before, describe, test } from 'node:test';

import type { PlaceLessonResponse, PlaceSessionUser, RabbiDirectoryResponse } from '@torabarabim/common';
import { eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { nanoid } from 'nanoid';

import { db } from '../src/db/client';
import { adminUsers, cities, lessons, places, rabbis } from '../src/db/schema';
import { PLACE_SESSION_COOKIE_NAME } from '../src/service/admin-auth/consts';
import * as adminPlaceAccountService from '../src/service/admin-place/account';
import * as adminPlaceService from '../src/service/admin-place/admin-place';
import {
  MalformedPlacePhotoHeaderError,
  PlacePhotoAspectRatioError,
  PlacePhotoTooLargeError,
  PlacePhotoTooSmallError,
  UnsupportedPlacePhotoTypeError,
} from '../src/service/place/errors';
import { validatePlacePhoto } from '../src/service/place/photo';
import { assertDatabaseReachable, buildPlaceTestApp, rawClient } from './app-harness';

const SEEDED_CITY_NAME = 'ירושלים';

const uniqueSuffix = (): string => nanoid(8);

// T9: the place portal's write path, its own guard, and the schema
// contract that keeps a place from ever choosing a venue.
describe('place API: write path', () => {
  let app: FastifyInstance;
  const cleanupLessonIds = new Set<string>();
  const cleanupRabbiIds = new Set<string>();
  const cleanupPlaceIds = new Set<string>();

  before(async () => {
    await assertDatabaseReachable();
    app = await buildPlaceTestApp();
  });

  afterEach(async () => {
    for (const id of cleanupLessonIds) await db.delete(lessons).where(eq(lessons.id, id));
    cleanupLessonIds.clear();
    for (const id of cleanupRabbiIds) await db.delete(rabbis).where(eq(rabbis.id, id));
    cleanupRabbiIds.clear();
    // Cascades to the place's own account row (`admin_users_place_id_unique`'s FK).
    for (const id of cleanupPlaceIds) await db.delete(places).where(eq(places.id, id));
    cleanupPlaceIds.clear();
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

  // Like `createRabbi`, but with a caller-chosen name: the two search tests
  // below need names they can search for, and one of them needs many
  // deterministically ordered rows.
  const createNamedRabbi = async (name: string, honorific: 'rav' | 'rabbanit' = 'rav'): Promise<string> => {
    const id = `test-rabbi-${uniqueSuffix()}`;
    await db.insert(rabbis).values({ id, name, honorific });
    cleanupRabbiIds.add(id);
    return id;
  };

  // Built through the admin-place service directly, the same way
  // `panel-auth.test.ts` and `agent-import.test.ts` build a rabbi account
  // fixture: creating it is not what is under test here, the place guard
  // and the place portal's write routes are.
  const createPlaceAccount = async (): Promise<{ placeId: string; email: string; password: string }> => {
    const cityCode = await jerusalemCode();
    const place = await adminPlaceService.create({ name: `מקום בדיקה ${uniqueSuffix()}`, street: 'רחוב הבדיקה 1', cityCode });
    cleanupPlaceIds.add(place.id);

    const email = `test-place-account-${uniqueSuffix()}@example.com`;
    const created = await adminPlaceAccountService.create(place.id, { email, username: `place-${uniqueSuffix()}` });
    return { placeId: place.id, email, password: created.temporaryPassword };
  };

  // Logs in through the real route (`POST /v1/panel/login`), exactly as
  // `agent-import.test.ts`'s `loginAsRabbi` does for the rabbi door: the
  // guard under test is `requirePlaceAuth` itself, not a bypass of it.
  const loginAsPlace = async (email: string, password: string): Promise<string> => {
    const res = await app.inject({ method: 'POST', url: '/v1/panel/login', payload: { identifier: email, password } });
    assert.equal(res.statusCode, 200);
    const cookie = res.cookies.find((c) => c.name === PLACE_SESSION_COOKIE_NAME);
    if (!cookie) throw new Error('expected the panel login route to set the place session cookie');
    return `${cookie.name}=${cookie.value}`;
  };

  const lessonPayload = (rabbiId: string, audience: 'men' | 'women' | 'mixed' = 'men'): Record<string, unknown> => ({
    rabbiId,
    audience,
    recurrence: { kind: 'weekly', weekdays: [0] },
    startTime: '20:00',
    durationMinutes: 60,
  });

  test('a place account saving for a rabbanit with audience men is refused; women succeeds', async () => {
    const rabbanitId = await createRabbi('rabbanit');
    const { email, password } = await createPlaceAccount();
    const cookie = await loginAsPlace(email, password);

    const refused = await app.inject({
      method: 'POST',
      url: '/v1/place/lessons',
      headers: { cookie },
      payload: lessonPayload(rabbanitId, 'men'),
    });
    assert.equal(refused.statusCode, 400);
    assert.equal(refused.json().error, 'rabbanit_audience_must_be_women');

    const accepted = await app.inject({
      method: 'POST',
      url: '/v1/place/lessons',
      headers: { cookie },
      payload: lessonPayload(rabbanitId, 'women'),
    });
    assert.equal(accepted.statusCode, 201);
    const created = accepted.json() as PlaceLessonResponse;
    assert.equal(created.audience, 'women');
    assert.equal(created.rabbiId, rabbanitId);
    cleanupLessonIds.add(created.id);
  });

  test('a nonexistent rabbiId paired with audience women is a clean 400, not a foreign-key 500', async () => {
    const { email, password } = await createPlaceAccount();
    const cookie = await loginAsPlace(email, password);

    const res = await app.inject({
      method: 'POST',
      url: '/v1/place/lessons',
      headers: { cookie },
      payload: lessonPayload('does-not-exist', 'women'),
    });
    assert.equal(res.statusCode, 400);
    assert.equal(res.json().error, 'unknown_rabbi');
  });

  test('a place cannot read or write another place\'s lesson: 404, not 403', async () => {
    const rabbiId = await createRabbi();
    const ownerAccount = await createPlaceAccount();
    const otherAccount = await createPlaceAccount();

    const ownerCookie = await loginAsPlace(ownerAccount.email, ownerAccount.password);
    const createRes = await app.inject({
      method: 'POST',
      url: '/v1/place/lessons',
      headers: { cookie: ownerCookie },
      payload: lessonPayload(rabbiId),
    });
    assert.equal(createRes.statusCode, 201);
    const lessonId = (createRes.json() as PlaceLessonResponse).id;
    cleanupLessonIds.add(lessonId);

    const otherCookie = await loginAsPlace(otherAccount.email, otherAccount.password);

    const getRes = await app.inject({ method: 'GET', url: `/v1/place/lessons/${lessonId}`, headers: { cookie: otherCookie } });
    assert.equal(getRes.statusCode, 404);

    const patchRes = await app.inject({
      method: 'PATCH',
      url: `/v1/place/lessons/${lessonId}`,
      headers: { cookie: otherCookie },
      payload: lessonPayload(rabbiId),
    });
    assert.equal(patchRes.statusCode, 404);

    // The owner still reads it fine, so the 404 above is genuinely about
    // ownership, not a bug that broke the lesson for everyone.
    const ownerGetRes = await app.inject({ method: 'GET', url: `/v1/place/lessons/${lessonId}`, headers: { cookie: ownerCookie } });
    assert.equal(ownerGetRes.statusCode, 200);
  });

  test('a deactivated place account\'s session is a 401, not a stale success', async () => {
    const { placeId, email, password } = await createPlaceAccount();
    const cookie = await loginAsPlace(email, password);

    await db.update(adminUsers).set({ isActive: false }).where(eq(adminUsers.placeId, placeId));

    const res = await app.inject({ method: 'GET', url: '/v1/place/profile', headers: { cookie } });
    assert.equal(res.statusCode, 401);
  });

  // Flagged as uncovered when the check was first written: the login
  // service already refuses an account whose own row is active but whose
  // place has been deactivated (`admin-auth/auth.ts`'s `isDeactivated`
  // check); this is the dedicated test for it.
  test('a place account whose own row is active but whose place is deactivated cannot log in', async () => {
    const { placeId, email, password } = await createPlaceAccount();
    await db.update(places).set({ isActive: false }).where(eq(places.id, placeId));

    const res = await app.inject({ method: 'POST', url: '/v1/panel/login', payload: { identifier: email, password } });
    assert.equal(res.statusCode, 403);
    assert.equal(res.json().error, 'account_deactivated');
  });

  test('a create payload carrying a venue field is rejected by the schema', async () => {
    const rabbiId = await createRabbi();
    const { email, password } = await createPlaceAccount();
    const cookie = await loginAsPlace(email, password);

    const res = await app.inject({
      method: 'POST',
      url: '/v1/place/lessons',
      headers: { cookie },
      payload: {
        ...lessonPayload(rabbiId),
        venue: { kind: 'address', name: 'לא אמור להתקבל', street: 'רחוב כלשהו 1', cityCode: await jerusalemCode() },
      },
    });
    assert.equal(res.statusCode, 400);
    assert.equal(res.json().error, 'invalid_request');
  });

  // The gap this closes: the logout button used to clear only the client's
  // cache, never the session itself, so a request that worked before it
  // still worked after. `POST /v1/place/logout` must delete the session,
  // not just the cookie, so the same cookie is refused afterward.
  test('logging out invalidates the session: a request that succeeded before it gets 401 after', async () => {
    const { placeId, email, password } = await createPlaceAccount();
    const cookie = await loginAsPlace(email, password);

    const meBefore = await app.inject({ method: 'GET', url: '/v1/place/me', headers: { cookie } });
    assert.equal(meBefore.statusCode, 200);
    assert.equal((meBefore.json() as PlaceSessionUser).placeId, placeId);

    const profileBefore = await app.inject({ method: 'GET', url: '/v1/place/profile', headers: { cookie } });
    assert.equal(profileBefore.statusCode, 200);

    const logoutRes = await app.inject({ method: 'POST', url: '/v1/place/logout', headers: { cookie } });
    assert.equal(logoutRes.statusCode, 204);

    const meAfter = await app.inject({ method: 'GET', url: '/v1/place/me', headers: { cookie } });
    assert.equal(meAfter.statusCode, 401);

    const profileAfter = await app.inject({ method: 'GET', url: '/v1/place/profile', headers: { cookie } });
    assert.equal(profileAfter.statusCode, 401);
  });

  // `POST /v1/place/logout` with no cookie at all must still be a clean
  // 204, the same as the rabbi pair: a device that is already logged out
  // must never fail the button that is trying to log it out.
  test('logging out with no session cookie is still a clean 204', async () => {
    const res = await app.inject({ method: 'POST', url: '/v1/place/logout' });
    assert.equal(res.statusCode, 204);
  });

  // The gap this closes: `GET /v1/rabbis` took no `q`, so the picker
  // fetched the largest allowed page per scope and filtered in the
  // browser, and a rabbi past the fiftieth row in a scope was unreachable.
  test('a rabbi past the old fifty-row page is reachable through q', async () => {
    // 51, not 50: if this block happens to sort before everything else
    // seeded at the same tier, its own 50th row would still land exactly
    // on a pageSize=50 page's last slot. A 51-row block guarantees its own
    // last row sits at index >= 50 no matter where the block starts.
    const BATCH_SIZE = 51;
    const runSuffix = uniqueSuffix();
    const names = Array.from({ length: BATCH_SIZE }, (_, index) => `רב-חיפוש-${runSuffix}-${String(index).padStart(3, '0')}`);
    const ids = await Promise.all(names.map((name) => createNamedRabbi(name)));
    const lastId = ids[BATCH_SIZE - 1];
    const lastName = names[BATCH_SIZE - 1];
    if (!lastId || !lastName) throw new Error('expected the batch to be non-empty');

    // Every row in the block shares the same prominence ('local', the
    // column default) and has no lesson, so within that tier they sort by
    // Hebrew collation on the zero-padded name alone: the last row in this
    // block can never land inside the first 50 rows of the whole list,
    // whatever else is seeded around it.
    const defaultPage = await app.inject({ method: 'GET', url: '/v1/rabbis?pageSize=50' });
    assert.equal(defaultPage.statusCode, 200);
    const defaultBody = defaultPage.json() as RabbiDirectoryResponse;
    assert.ok(!defaultBody.items.some((item) => item.id === lastId), 'the last row of a 50-row block must not fit in a single pageSize=50 page');

    const searchRes = await app.inject({ method: 'GET', url: `/v1/rabbis?q=${encodeURIComponent(lastName)}` });
    assert.equal(searchRes.statusCode, 200);
    const searchBody = searchRes.json() as RabbiDirectoryResponse;
    assert.equal(searchBody.total, 1);
    assert.ok(searchBody.items.some((item) => item.id === lastId), 'q must reach a rabbi past the fiftieth row');
  });

  // 0026: a rabbanit's audience is women-only, but a place still has to be
  // able to find her to name her on a lesson. Search must not widen
  // `scope=general` to include her, and must not hide her from
  // `scope=women` either.
  test('a rabbanit is reachable by search under scope=women, and stays excluded from scope=general even when her name matches', async () => {
    const rabbanitName = `הרבנית-בדיקה-${uniqueSuffix()}`;
    const rabbanitId = await createNamedRabbi(rabbanitName, 'rabbanit');

    const generalRes = await app.inject({ method: 'GET', url: `/v1/rabbis?q=${encodeURIComponent(rabbanitName)}` });
    assert.equal(generalRes.statusCode, 200);
    assert.ok(!(generalRes.json() as RabbiDirectoryResponse).items.some((item) => item.id === rabbanitId));

    const womenRes = await app.inject({ method: 'GET', url: `/v1/rabbis?scope=women&q=${encodeURIComponent(rabbanitName)}` });
    assert.equal(womenRes.statusCode, 200);
    const womenBody = womenRes.json() as RabbiDirectoryResponse;
    assert.equal(womenBody.total, 1);
    assert.ok(womenBody.items.some((item) => item.id === rabbanitId));
  });
});

// T10: the place photo's own validation, exercised directly against the
// pure function so a truncated or malformed header is asserted precisely,
// without crafting a real, decodable image file.
describe('place photo validation', () => {
  const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

  // `readPngDimensions` reads width/height from fixed byte offsets (16, 20)
  // with no real decode, so a synthetic 24-byte buffer carrying just the
  // signature and those two values is exactly what it needs, real IHDR
  // chunk bytes or not.
  const buildPngBytes = (width: number, height: number): Buffer => {
    const bytes = Buffer.alloc(24);
    PNG_SIGNATURE.forEach((byte, index) => {
      bytes[index] = byte;
    });
    bytes.writeUInt32BE(width, 16);
    bytes.writeUInt32BE(height, 20);
    return bytes;
  };

  // The signature alone, with nothing after it: enough for `sniff` to
  // recognise it as a png, not enough for `readPngDimensions` to read a
  // width or height from.
  const buildTruncatedPngBytes = (length: number): Buffer => {
    const bytes = Buffer.alloc(length);
    PNG_SIGNATURE.forEach((byte, index) => {
      if (index < length) bytes[index] = byte;
    });
    return bytes;
  };

  test('800x400 is rejected on the height floor although its ratio (2.0) is inside the band', () => {
    const bytes = buildPngBytes(800, 400);
    assert.throws(() => validatePlacePhoto(bytes), PlacePhotoTooSmallError);
  });

  test('a portrait image is rejected on the aspect ratio band', () => {
    const bytes = buildPngBytes(1200, 2000);
    assert.throws(() => validatePlacePhoto(bytes), PlacePhotoAspectRatioError);
  });

  test('a webp image is rejected: only jpg and png are accepted', () => {
    const bytes = Buffer.concat([Buffer.from('RIFF', 'ascii'), Buffer.alloc(4), Buffer.from('WEBP', 'ascii')]);
    assert.throws(() => validatePlacePhoto(bytes), UnsupportedPlacePhotoTypeError);
  });

  test('a file over the upload limit is rejected on size, before it is ever sniffed', () => {
    const bytes = Buffer.alloc(6_000_000);
    assert.throws(() => validatePlacePhoto(bytes), PlacePhotoTooLargeError);
  });

  test('a truncated header is rejected cleanly rather than reading past the buffer', () => {
    const bytes = buildTruncatedPngBytes(12);
    assert.throws(() => validatePlacePhoto(bytes), MalformedPlacePhotoHeaderError);
  });

  test('a valid 16:9 photo at exactly the floor passes validation', () => {
    const bytes = buildPngBytes(800, 450);
    const result = validatePlacePhoto(bytes);
    assert.equal(result.contentType, 'image/png');
    assert.equal(result.extension, 'png');
  });

  // The defect this change fixes: a real synagogue-facade photo, cropped to
  // 16:9 by the panel's crop step, close to the owner's actual 881x804
  // photo after cropping. It used to fail the old 1200x675 floor outright,
  // no crop could have saved it, and now clears the 800x450 floor.
  test('an 881x495 photo, a 16:9 crop of the owner\'s real photo, now passes validation', () => {
    const bytes = buildPngBytes(881, 495);
    const result = validatePlacePhoto(bytes);
    assert.equal(result.contentType, 'image/png');
    assert.equal(result.extension, 'png');
  });
});
