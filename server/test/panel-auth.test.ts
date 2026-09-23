import assert from 'node:assert/strict';
import { after, afterEach, before, describe, test } from 'node:test';

import type { PanelLoginResponse } from '@torabarabim/common';
import { eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { nanoid } from 'nanoid';

import { db } from '../src/db/client';
import { adminUsers, cities, places, rabbis } from '../src/db/schema';
import { PLACE_SESSION_COOKIE_NAME, RABBI_DEFAULT_LANDING_PATH, RABBI_SESSION_COOKIE_NAME } from '../src/service/admin-auth/consts';
import { hashPassword } from '../src/service/admin-auth/password';
import * as adminRabbiAccountService from '../src/service/admin-rabbi-account/admin-rabbi-account';
import * as adminUserService from '../src/service/admin-user/admin-user';
import { assertDatabaseReachable, buildAgentImportTestApp, rawClient } from './app-harness';

const SEEDED_CITY_NAME = 'ירושלים';

const uniqueSuffix = (): string => nanoid(8);

// T11: the shared panel login door (`POST /v1/panel/login`). Admin login
// itself (`POST /v1/admin/login`) is untouched and has its own suite; this
// file exercises only the surface Wave 4 added or changed: the shared
// door's cookie choice, its refusal of an admin credential, and the
// deactivated-account check order that must never leak a password change
// through response shape.
describe('panel API: shared login door', () => {
  let app: FastifyInstance;
  const cleanupRabbiIds = new Set<string>();
  const cleanupAdminUserIds = new Set<string>();
  const cleanupPlaceIds = new Set<string>();

  before(async () => {
    await assertDatabaseReachable();
    app = await buildAgentImportTestApp(undefined);
  });

  afterEach(async () => {
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

  const jerusalemCode = async (): Promise<number> => {
    const rows = await db.select({ code: cities.code }).from(cities).where(eq(cities.nameHe, SEEDED_CITY_NAME)).limit(1);
    const row = rows[0];
    if (!row) throw new Error('expected the seeded city to exist');
    return row.code;
  };

  const createRabbi = async (): Promise<string> => {
    const id = `test-rabbi-${uniqueSuffix()}`;
    await db.insert(rabbis).values({ id, name: `רב בדיקה ${uniqueSuffix()}`, honorific: 'rav' });
    cleanupRabbiIds.add(id);
    return id;
  };

  // The rabbi account is created through the admin-rabbi-account service,
  // same as agent-import.test.ts's `loginAsRabbi`: creating the fixture is
  // not what is under test here, `POST /v1/panel/login` is.
  const createRabbiAccount = async (): Promise<{ id: string; email: string; password: string }> => {
    const rabbiId = await createRabbi();
    const email = `test-rabbi-account-${uniqueSuffix()}@example.com`;
    const created = await adminRabbiAccountService.create(rabbiId, { email, username: `rabbi-${uniqueSuffix()}` });
    return { id: created.id, email, password: created.temporaryPassword };
  };

  // No admin-place-account service exists yet (Wave 6 builds the place
  // panel), so the fixture is written directly: a place row plus its
  // account row, the same shape `admin_users_role_shape` requires.
  const createPlaceAccount = async (): Promise<{ id: string; email: string; password: string }> => {
    const placeId = `test-place-${uniqueSuffix()}`;
    const cityCode = await jerusalemCode();
    await db.insert(places).values({
      id: placeId,
      slug: placeId,
      name: `מקום בדיקה ${uniqueSuffix()}`,
      street: 'רחוב הבדיקה 1',
      cityCode,
    });
    cleanupPlaceIds.add(placeId);

    const email = `test-place-account-${uniqueSuffix()}@example.com`;
    const password = 'Test-Password-123!';
    const [row] = await db
      .insert(adminUsers)
      .values({
        id: nanoid(),
        email,
        passwordHash: await hashPassword(password),
        name: 'בעל מקום בדיקה',
        role: 'place',
        placeId,
      })
      .returning();
    if (!row) throw new Error('insert into admin_users returned no row');
    return { id: row.id, email, password };
  };

  const createAdminAccount = async (): Promise<{ email: string; password: string }> => {
    const email = `test-admin-${uniqueSuffix()}@example.com`;
    const password = 'Test-Password-123!';
    const record = await adminUserService.create({ name: 'מנהל בדיקה', email, username: `admin-${uniqueSuffix()}`, password });
    cleanupAdminUserIds.add(record.id);
    return { email, password };
  };

  test('rabbi credentials set the rabbi cookie, not the place cookie', async () => {
    const { email, password } = await createRabbiAccount();
    const res = await app.inject({ method: 'POST', url: '/v1/panel/login', payload: { identifier: email, password } });
    assert.equal(res.statusCode, 200);
    assert.ok(res.cookies.find((c) => c.name === RABBI_SESSION_COOKIE_NAME), 'expected the rabbi session cookie to be set');
    assert.equal(res.cookies.find((c) => c.name === PLACE_SESSION_COOKIE_NAME), undefined, 'the place cookie must never be set by a rabbi login');
  });

  test('place credentials set the place cookie, not the rabbi cookie', async () => {
    const { email, password } = await createPlaceAccount();
    const res = await app.inject({ method: 'POST', url: '/v1/panel/login', payload: { identifier: email, password } });
    assert.equal(res.statusCode, 200);
    assert.ok(res.cookies.find((c) => c.name === PLACE_SESSION_COOKIE_NAME), 'expected the place session cookie to be set');
    assert.equal(res.cookies.find((c) => c.name === RABBI_SESSION_COOKIE_NAME), undefined, 'the rabbi cookie must never be set by a place login');
  });

  test('admin credentials are refused at the shared panel door', async () => {
    const { email, password } = await createAdminAccount();
    const res = await app.inject({ method: 'POST', url: '/v1/panel/login', payload: { identifier: email, password } });
    assert.equal(res.statusCode, 401);
    assert.equal(res.json().error, 'invalid_credentials');
    assert.equal(res.cookies.length, 0, 'a refused admin login must set no cookie at all');
  });

  test('a deactivated account with the correct password is a 403 account_deactivated', async () => {
    const { id, email, password } = await createRabbiAccount();
    await db.update(adminUsers).set({ isActive: false }).where(eq(adminUsers.id, id));

    const res = await app.inject({ method: 'POST', url: '/v1/panel/login', payload: { identifier: email, password } });
    assert.equal(res.statusCode, 403);
    assert.equal(res.json().error, 'account_deactivated');
  });

  // The case that must not leak: a deactivated account with the *wrong*
  // password still answers the generic 401, never the 403 that would
  // confirm the password was actually correct.
  test('a deactivated account with the wrong password is the generic 401, not 403', async () => {
    const { id, email } = await createRabbiAccount();
    await db.update(adminUsers).set({ isActive: false }).where(eq(adminUsers.id, id));

    const res = await app.inject({ method: 'POST', url: '/v1/panel/login', payload: { identifier: email, password: 'definitely-wrong' } });
    assert.equal(res.statusCode, 401);
    assert.equal(res.json().error, 'invalid_credentials');
  });

  test('an unknown identifier is the generic 401', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/panel/login',
      payload: { identifier: `no-such-account-${uniqueSuffix()}@example.com`, password: 'whatever-1234' },
    });
    assert.equal(res.statusCode, 401);
    assert.equal(res.json().error, 'invalid_credentials');
  });

  test('a `from` naming another role\'s panel root is not returned as landingPath', async () => {
    const { email, password } = await createRabbiAccount();
    const res = await app.inject({
      method: 'POST',
      url: '/v1/panel/login',
      payload: { identifier: email, password, from: '/place/dashboard' },
    });
    assert.equal(res.statusCode, 200);
    const body = res.json() as PanelLoginResponse;
    assert.notEqual(body.landingPath, '/place/dashboard');
    assert.equal(body.landingPath, RABBI_DEFAULT_LANDING_PATH);
  });
});
