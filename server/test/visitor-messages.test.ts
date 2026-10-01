import assert from 'node:assert/strict';
import { after, afterEach, before, beforeEach, describe, mock, test } from 'node:test';

import type { AdminVisitorMessage, VisitorMessageListResponse } from '@torabarabim/common';
import { eq, like, sql } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { nanoid } from 'nanoid';

import { loadConfig } from '../src/config';
import { db } from '../src/db/client';
import { adminUsers, visitorMessages } from '../src/db/schema';
import { SESSION_COOKIE_NAME } from '../src/service/admin-auth/consts';
import * as adminUserService from '../src/service/admin-user/admin-user';
import { ADMIN_MESSAGES_PATH, SITE_ORIGIN, VISITOR_MESSAGE_TYPE_LABELS_HE } from '../src/service/visitor-message/consts';
import telegram from '../src/telegram/telegram';
import { createTelegramClient } from '../src/telegram/client';
import { assertDatabaseReachable, buildVisitorMessageTestApp, rawClient } from './app-harness';

const TEST_NAME_PREFIX = 'test-vm-';
const BOT_TOKEN = 'SECRET-BOT-TOKEN-123';

const uniqueSuffix = (): string => nanoid(8);
const testName = (): string => `${TEST_NAME_PREFIX}${uniqueSuffix()}`;

const messageCount = async (): Promise<number> => {
  const rows = await db.select({ count: sql<number>`count(*)::int` }).from(visitorMessages);
  return rows[0]?.count ?? 0;
};

const validBody = (overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
  type: 'rabbi-request',
  name: testName(),
  phone: '+972 52-123-4567',
  message: 'הרב דוד מלמד שיעור בכל יום שלישי בבית הכנסת המרכזי',
  ...overrides,
});

describe('visitor message config and Telegram client', () => {
  const baseEnv = {
    CORS_ORIGINS: 'http://localhost:5173',
    DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
    SESSION_SECRET: 'x'.repeat(32),
    STORAGE_BUCKET: 'bucket',
    STORAGE_PUBLIC_BASE_URL: 'http://localhost:9000/bucket',
  };

  afterEach(() => {
    mock.restoreAll();
  });

  // Test 5.
  test('loadConfig: absent means off, valid gives the credentials, malformed throws without echoing the token', () => {
    assert.equal(loadConfig({ ...baseEnv }).telegram, undefined);
    assert.equal(loadConfig({ ...baseEnv, TELEGRAM_CREDENTIALS: '' }).telegram, undefined);

    const valid = JSON.stringify({ botToken: BOT_TOKEN, chatId: '-100123' });
    assert.deepEqual(loadConfig({ ...baseEnv, TELEGRAM_CREDENTIALS: valid }).telegram, { botToken: BOT_TOKEN, chatId: '-100123' });

    const malformedValues = [`{"botToken":"${BOT_TOKEN}",`, JSON.stringify({ botToken: BOT_TOKEN }), JSON.stringify({ botToken: BOT_TOKEN, chatId: '' })];
    for (const TELEGRAM_CREDENTIALS of malformedValues) {
      assert.throws(
        () => loadConfig({ ...baseEnv, TELEGRAM_CREDENTIALS }),
        (error: unknown) => {
          assert.ok(error instanceof Error);
          assert.match(error.message, /TELEGRAM_CREDENTIALS/);
          assert.ok(!error.message.includes(BOT_TOKEN), 'the boot error must not contain the bot token');
          return true;
        },
      );
    }
  });

  // Test 6.
  test('an unconfigured client resolves skipped and never calls fetch', async () => {
    const fetchMock = mock.method(globalThis, 'fetch', async () => new Response('{}'));

    assert.equal(await createTelegramClient(undefined).sendMessage('x'), 'skipped');
    assert.equal(fetchMock.mock.callCount(), 0);
  });

  // Test 7.
  test('a failed send throws an error that does not contain the bot token', async () => {
    const client = createTelegramClient({ botToken: BOT_TOKEN, chatId: '-100123' });

    mock.method(globalThis, 'fetch', async () => Response.json({ ok: false, description: 'Bad Request: chat not found' }, { status: 400 }));
    await assert.rejects(client.sendMessage('x'), (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.match(error.message, /400/);
      assert.match(error.message, /chat not found/);
      assert.ok(!error.message.includes(BOT_TOKEN));
      return true;
    });

    mock.restoreAll();
    mock.method(globalThis, 'fetch', async (url: unknown) => {
      throw new TypeError(`fetch failed for ${String(url)}`);
    });
    await assert.rejects(client.sendMessage('x'), (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.ok(!error.message.includes(BOT_TOKEN));
      assert.equal(error.cause, undefined);
      return true;
    });
  });
});

describe('visitor messages API', () => {
  let app: FastifyInstance;
  let originalSuperId: string | undefined;
  let superCookie: string;
  let plainCookie: string;
  const cleanupAdminUserIds = new Set<string>();
  const cleanupMessageIds = new Set<string>();

  const login = async (identifier: string, password: string): Promise<string> => {
    const res = await app.inject({ method: 'POST', url: '/v1/admin/login', payload: { identifier, password } });
    assert.equal(res.statusCode, 200);
    const cookie = res.cookies.find((c) => c.name === SESSION_COOKIE_NAME);
    if (!cookie) throw new Error('expected the admin login route to set a session cookie');
    return `${cookie.name}=${cookie.value}`;
  };

  const createAdmin = async (isSuper: boolean): Promise<string> => {
    const email = `test-admin-${uniqueSuffix()}@example.com`;
    const password = 'Test-Password-123!';
    const record = await adminUserService.create({ name: 'מנהל בדיקה', email, username: `admin-${uniqueSuffix()}`, password });
    cleanupAdminUserIds.add(record.id);
    if (isSuper) await db.update(adminUsers).set({ isSuper: true }).where(eq(adminUsers.id, record.id));
    return login(email, password);
  };

  const insertMessage = async (overrides: Partial<typeof visitorMessages.$inferInsert> = {}): Promise<string> => {
    const id = `${TEST_NAME_PREFIX}${uniqueSuffix()}`;
    await db.insert(visitorMessages).values({
      id,
      type: 'volunteer',
      name: testName(),
      phone: '0521234567',
      message: 'הודעת בדיקה',
      ...overrides,
    });
    cleanupMessageIds.add(id);
    return id;
  };

  const listMessages = async (query = ''): Promise<{ statusCode: number; body: VisitorMessageListResponse }> => {
    const res = await app.inject({ method: 'GET', url: `/v1/admin/visitor-messages${query}`, headers: { cookie: superCookie } });
    return { statusCode: res.statusCode, body: res.json() as VisitorMessageListResponse };
  };

  const patchMessage = (id: string, payload: Record<string, unknown>) =>
    app.inject({ method: 'PATCH', url: `/v1/admin/visitor-messages/${id}`, headers: { cookie: superCookie }, payload });

  before(async () => {
    await assertDatabaseReachable();
    app = await buildVisitorMessageTestApp();

    // `admin_users_single_super_admin` allows exactly one super admin, so the
    // existing one (if any) hands the flag to this suite's admin and gets it
    // back in `after`. A crash in between is recoverable with
    // `npm run admin:promote-super -w server -- <email>`.
    const existingSuper = await db.select({ id: adminUsers.id }).from(adminUsers).where(eq(adminUsers.isSuper, true)).limit(1);
    originalSuperId = existingSuper[0]?.id;
    if (originalSuperId) await db.update(adminUsers).set({ isSuper: false }).where(eq(adminUsers.id, originalSuperId));

    superCookie = await createAdmin(true);
    plainCookie = await createAdmin(false);
  });

  beforeEach(() => {
    mock.method(telegram, 'sendMessage', async () => 'sent' as const);
  });

  afterEach(async () => {
    mock.restoreAll();
    await db.delete(visitorMessages).where(like(visitorMessages.name, `${TEST_NAME_PREFIX}%`));
    for (const id of cleanupMessageIds) await db.delete(visitorMessages).where(eq(visitorMessages.id, id));
    cleanupMessageIds.clear();
  });

  after(async () => {
    for (const id of cleanupAdminUserIds) await db.delete(adminUsers).where(eq(adminUsers.id, id));
    if (originalSuperId) await db.update(adminUsers).set({ isSuper: true }).where(eq(adminUsers.id, originalSuperId));
    await app.close();
    await rawClient.end({ timeout: 5 });
  });

  const storedRows = (name: unknown) => db.select().from(visitorMessages).where(eq(visitorMessages.name, String(name)));

  // Test 1.
  test('a valid rabbi request is stored with the phone normalised and the type as sent', async () => {
    const body = validBody();
    const res = await app.inject({ method: 'POST', url: '/v1/visitor-messages', payload: body });

    assert.equal(res.statusCode, 204);
    const rows = await storedRows(body.name);
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.phone, '0521234567');
    assert.equal(rows[0]?.type, 'rabbi-request');
    assert.equal(rows[0]?.handledAt, null);
  });

  // Test 2.
  test('the alert carries the local phone, the type label, the message and the panel link, never +972', async () => {
    const body = validBody();
    await app.inject({ method: 'POST', url: '/v1/visitor-messages', payload: body });

    const sendMessage = telegram.sendMessage as unknown as ReturnType<typeof mock.fn>;
    assert.equal(sendMessage.mock.callCount(), 1);
    const text = String(sendMessage.mock.calls[0]?.arguments[0]);
    assert.ok(text.includes('052-123-4567'));
    assert.ok(!text.includes('+972'));
    assert.ok(text.includes(VISITOR_MESSAGE_TYPE_LABELS_HE['rabbi-request']));
    assert.ok(text.includes(String(body.message)));
    assert.ok(text.includes(`${SITE_ORIGIN}${ADMIN_MESSAGES_PATH}`));
  });

  // Test 3.
  test('when the alert rejects the response is still 204 and the row exists', async () => {
    mock.restoreAll();
    mock.method(telegram, 'sendMessage', async () => {
      throw new Error('Telegram is down');
    });
    const body = validBody();

    const res = await app.inject({ method: 'POST', url: '/v1/visitor-messages', payload: body });

    assert.equal(res.statusCode, 204);
    assert.equal((await storedRows(body.name)).length, 1);
  });

  // Test 4.
  const invalidBodies: Array<{ label: string; body: Record<string, unknown>; field: string }> = [
    { label: 'a missing name', body: validBody({ name: undefined }), field: 'name' },
    { label: 'a blank name', body: validBody({ name: '   ' }), field: 'name' },
    { label: 'a missing phone', body: validBody({ phone: undefined }), field: 'phone' },
    { label: 'a landline', body: validBody({ phone: '03-1234567' }), field: 'phone' },
    { label: 'a missing message', body: validBody({ message: undefined }), field: 'message' },
    { label: 'a message over 1000 characters', body: validBody({ message: 'א'.repeat(1001) }), field: 'message' },
    { label: 'an unknown type', body: validBody({ type: 'advertisement' }), field: 'type' },
  ];
  for (const { label, body, field } of invalidBodies) {
    test(`${label} is a 400 naming ${field}, stores nothing and sends no alert`, async () => {
      const before = await messageCount();

      const res = await app.inject({ method: 'POST', url: '/v1/visitor-messages', payload: body });

      assert.equal(res.statusCode, 400);
      const json = res.json() as { error: string; details: { fieldErrors: Record<string, string[] | undefined> } };
      assert.equal(json.error, 'invalid_request');
      assert.ok((json.details.fieldErrors[field] ?? []).length > 0, `expected fieldErrors.${field}, got ${JSON.stringify(json.details.fieldErrors)}`);
      assert.equal(await messageCount(), before);
      assert.equal((telegram.sendMessage as unknown as ReturnType<typeof mock.fn>).mock.callCount(), 0);
    });
  }

  // Test 8.
  test('both admin routes are 401 without a session and 403 super_admin_required for a non-super admin', async () => {
    const requests = [
      { method: 'GET', url: '/v1/admin/visitor-messages' },
      { method: 'PATCH', url: '/v1/admin/visitor-messages/some-id', payload: { handled: true } },
    ] as const;

    for (const request of requests) {
      const anonymous = await app.inject(request);
      assert.equal(anonymous.statusCode, 401, `${request.method} without a session`);

      const plain = await app.inject({ ...request, headers: { cookie: plainCookie } });
      assert.equal(plain.statusCode, 403, `${request.method} as a non-super admin`);
      assert.equal((plain.json() as { error: string }).error, 'super_admin_required');
    }
  });

  // Test 9.
  test('the list is newest first, filters by status, answers an empty filter with 200, and counts every message in unfilteredTotal', async () => {
    const oldest = await insertMessage({ createdAt: new Date('2026-01-01T10:00:00Z') });
    const middleHandled = await insertMessage({ createdAt: new Date('2026-01-02T10:00:00Z'), handledAt: new Date('2026-01-03T10:00:00Z') });
    const newest = await insertMessage({ createdAt: new Date('2026-01-04T10:00:00Z') });
    const mine = new Set([oldest, middleHandled, newest]);
    const idsOf = (response: VisitorMessageListResponse): string[] => response.items.map((item) => item.id).filter((id) => mine.has(id));

    const all = await listMessages();
    assert.equal(all.statusCode, 200);
    assert.deepEqual(idsOf(all.body), [newest, middleHandled, oldest]);
    assert.equal(all.body.unfilteredTotal, await messageCount());

    const unhandled = await listMessages('?status=unhandled');
    assert.deepEqual(idsOf(unhandled.body), [newest, oldest]);
    assert.ok(unhandled.body.items.every((item) => item.status === 'unhandled'));
    assert.equal(unhandled.body.unfilteredTotal, all.body.unfilteredTotal);

    const handled = await listMessages('?status=handled');
    assert.deepEqual(idsOf(handled.body), [middleHandled]);
    assert.ok(handled.body.items.every((item) => item.status === 'handled'));

    await db.update(visitorMessages).set({ handledAt: null }).where(eq(visitorMessages.id, middleHandled));
    const noMatches = await listMessages('?status=handled');
    assert.equal(noMatches.statusCode, 200);
    assert.deepEqual(noMatches.body.items, [], 'expected no handled messages in the table besides this test\'s own');
    assert.equal(noMatches.body.total, 0);
    assert.equal(noMatches.body.unfilteredTotal, all.body.unfilteredTotal);
  });

  // Test 10.
  test('PATCH handled marks, keeps the original handledAt on a repeat, undoes on false, and 404s an unknown id', async () => {
    const id = await insertMessage();

    const first = await patchMessage(id, { handled: true });
    assert.equal(first.statusCode, 200);
    const firstBody = first.json() as AdminVisitorMessage;
    assert.equal(firstBody.status, 'handled');
    const firstHandledAt = firstBody.status === 'handled' ? firstBody.handledAt : undefined;
    assert.ok(firstHandledAt);

    const second = await patchMessage(id, { handled: true });
    const secondBody = second.json() as AdminVisitorMessage;
    assert.equal(secondBody.status === 'handled' ? secondBody.handledAt : undefined, firstHandledAt);

    const undone = await patchMessage(id, { handled: false });
    assert.equal(undone.statusCode, 200);
    const undoneBody = undone.json() as AdminVisitorMessage;
    assert.equal(undoneBody.status, 'unhandled');
    assert.equal('handledAt' in undoneBody, false);

    const unknown = await patchMessage('no-such-message', { handled: true });
    assert.equal(unknown.statusCode, 404);
    assert.equal((unknown.json() as { error: string }).error, 'not_found');
  });

  // Test 10a.
  test('PATCH handlingNote stores the trimmed note, clears on empty, enforces the limit, and never touches the other field', async () => {
    const id = await insertMessage({ handledAt: new Date('2026-01-03T10:00:00Z') });

    const saved = await patchMessage(id, { handlingNote: '  התקשרנו לגבאי  ' });
    assert.equal(saved.statusCode, 200);
    const savedBody = saved.json() as AdminVisitorMessage;
    assert.equal(savedBody.handlingNote, 'התקשרנו לגבאי');
    assert.equal(savedBody.status, 'handled', 'a note save must leave the handled status as it was');

    const tooLong = await patchMessage(id, { handlingNote: 'א'.repeat(501) });
    assert.equal(tooLong.statusCode, 400);
    const tooLongBody = tooLong.json() as { details: { fieldErrors: { handlingNote?: string[] } } };
    assert.ok((tooLongBody.details.fieldErrors.handlingNote ?? []).length > 0);
    const [afterRejected] = await db.select().from(visitorMessages).where(eq(visitorMessages.id, id));
    assert.equal(afterRejected?.handlingNote, 'התקשרנו לגבאי');

    const toggled = await patchMessage(id, { handled: false });
    assert.equal((toggled.json() as AdminVisitorMessage).handlingNote, 'התקשרנו לגבאי', 'a toggle must leave the note as it was');

    const cleared = await patchMessage(id, { handlingNote: '' });
    assert.equal(cleared.statusCode, 200);
    assert.equal((cleared.json() as AdminVisitorMessage).handlingNote, null);
    const [afterCleared] = await db.select().from(visitorMessages).where(eq(visitorMessages.id, id));
    assert.equal(afterCleared?.handlingNote, null, 'an empty note is stored as null, never as an empty string');

    const empty = await patchMessage(id, {});
    assert.equal(empty.statusCode, 400);
  });
});
