import assert from 'node:assert/strict';
import { after, afterEach, before, describe, test } from 'node:test';

import type { PlaceLessonResponse } from '@torabarabim/common';
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

  test('1200x600 is rejected on the height floor although its ratio (2.0) is inside the band', () => {
    const bytes = buildPngBytes(1200, 600);
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
    const bytes = buildPngBytes(1200, 675);
    const result = validatePlacePhoto(bytes);
    assert.equal(result.contentType, 'image/png');
    assert.equal(result.extension, 'png');
  });
});
