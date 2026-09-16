import assert from 'node:assert/strict';
import { after, afterEach, before, describe, test } from 'node:test';

import type { AgentImportApplyResult, AgentImportPlanResponse, LessonImportFile, LessonImportRow } from '@torabarabim/common';
import { eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { nanoid } from 'nanoid';

import { db } from '../src/db/client';
import { adminUsers, cities, lessonExceptions, lessonImportDismissedKeys, lessonImportRabbiLinks, lessonImportRules, lessonImportRuns, lessons, rabbis } from '../src/db/schema';
import { SESSION_COOKIE_NAME, RABBI_SESSION_COOKIE_NAME } from '../src/service/admin-auth/consts';
import * as adminRabbiAccountService from '../src/service/admin-rabbi-account/admin-rabbi-account';
import * as adminUserService from '../src/service/admin-user/admin-user';
import { cleanCityText, nameKeyOf, placeKeyOf, resolveBuiltInCityAlias, resolveWeekday, resolveWeekdayNote } from '../src/service/lesson-import/clean';
import { BUILT_IN_AUDIENCE_ALIASES, IMPORT_ADVISORY_LOCK_KEY } from '../src/service/lesson-import/consts';
import { sha256Of } from '../src/service/lesson-import/digest';
import { lessonImportFileSchema } from '../src/service/lesson-import/models';
import { stripLeadingHonorific } from '../src/service/shared/name';
import { assertDatabaseReachable, buildAgentImportTestApp, rawClient } from './app-harness';

// `rawClient`'s exported type (see app-harness.ts) only exposes `end`,
// which is all the rest of the suite needs; the busy-lock test below is
// the one place that needs to open and hold a real transaction by hand.
type SqlWithBegin = typeof rawClient & { begin: <T>(fn: (sql: typeof rawClient) => Promise<T>) => Promise<T> };
const sqlWithBegin = rawClient as unknown as SqlWithBegin;

const SEEDED_CITY_NAME = 'ירושלים';
const SEEDED_RABBI_ID = 'rabbi-1';

// The suite invents its own key and hands it to the harness, so it never
// depends on `IMPORT_AGENT_KEY` being set in the environment it runs in:
// CI writes a .env without it, and a developer machine may have any value.
const agentKey = 'test-agent-key-0123456789abcdef0123456789abcdef';
const AUTH_HEADER = { authorization: `Bearer ${agentKey}` };

const uniqueSuffix = (): string => nanoid(8);

const baseRow = (overrides: Partial<LessonImportRow> = {}): LessonImportRow => ({
  rabbiName: 'רב בדיקה',
  weekday: 'ראשון',
  startTime: '20:00',
  timeKind: 'שיעור',
  deliveryType: 'שיעור פיזי',
  city: SEEDED_CITY_NAME,
  place: 'בית כנסת הבדיקה',
  street: 'רחוב הבדיקה 1',
  recurrence: 'קבוע',
  sources: ['test-source.example.com'],
  needsReview: false,
  ...overrides,
});

const buildFile = (rows: LessonImportRow[], sourceOverrides: Partial<LessonImportFile['sources'][number]> = {}): LessonImportFile => {
  const domain = rows[0]?.sources[0] ?? 'test-source.example.com';
  return {
    schemaVersion: 1,
    // Fixed, not `new Date()`: in real use, `importer plan <file>` and
    // `importer apply <file>` both read the same file off disk, so its
    // `collectedAt` (and therefore its `fileSha256`, part of the plan
    // digest) is identical between the two calls. A test that rebuilds the
    // file with `buildFile(...)` a second time for `apply` must still
    // describe the same file, or the digest legitimately changes and
    // `apply` correctly answers `plan_changed`.
    collectedAt: '2026-09-15T00:00:00.000Z',
    week: '2026-W38',
    sources: [
      {
        domain,
        name: domain,
        url: `https://${domain}/`,
        format: 'html',
        status: 'ok',
        rowCount: rows.length,
        ...sourceOverrides,
      },
    ],
    rows,
    dropped: [],
  };
};

describe('agent import', () => {
  let app: FastifyInstance;
  const cleanupRabbiIds = new Set<string>();
  const cleanupLessonIds = new Set<string>();
  const cleanupNameKeys = new Set<string>();
  const cleanupRuleMatchTexts = new Set<string>();
  const cleanupImportKeys = new Set<string>();
  const cleanupAdminUserIds = new Set<string>();
  const cleanupRunFileShas = new Set<string>();

  before(async () => {
    await assertDatabaseReachable();
    app = await buildAgentImportTestApp(agentKey);
  });

  // Runs after every single test, not only once at the end. `--test-
  // concurrency=1` (server/package.json) now serialises the whole suite,
  // which is what actually stops this file's test-only rabbis from
  // colliding with `public-api.test.ts`'s unfiltered, alphabetically
  // sorted `GET /v1/rabbis` assertion; cleaning up per test on top of that
  // is isolation hygiene between this file's own tests, not a race fix.
  afterEach(async () => {
    for (const id of cleanupLessonIds) await db.delete(lessons).where(eq(lessons.id, id));
    cleanupLessonIds.clear();
    for (const id of cleanupRabbiIds) await db.delete(rabbis).where(eq(rabbis.id, id));
    cleanupRabbiIds.clear();
    for (const id of cleanupAdminUserIds) await db.delete(adminUsers).where(eq(adminUsers.id, id));
    cleanupAdminUserIds.clear();
    for (const nameKey of cleanupNameKeys) await db.delete(lessonImportRabbiLinks).where(eq(lessonImportRabbiLinks.nameKey, nameKey));
    cleanupNameKeys.clear();
    for (const matchText of cleanupRuleMatchTexts) await db.delete(lessonImportRules).where(eq(lessonImportRules.matchText, matchText));
    cleanupRuleMatchTexts.clear();
    for (const importKey of cleanupImportKeys) await db.delete(lessonImportDismissedKeys).where(eq(lessonImportDismissedKeys.importKey, importKey));
    cleanupImportKeys.clear();
    // Only the run rows this suite itself produced, by their fileSha256:
    // this is a shared local database (the owner's own live-trial runs
    // live in the same table), so wiping the whole table would delete his
    // data too.
    for (const fileSha256 of cleanupRunFileShas) await db.delete(lessonImportRuns).where(eq(lessonImportRuns.fileSha256, fileSha256));
    cleanupRunFileShas.clear();
  });

  after(async () => {
    await app.close();
    await rawClient.end({ timeout: 5 });
  });

  // Logs in through the real route (`POST /v1/admin/login`) and returns the
  // signed session cookie header exactly as the browser would send it back,
  // so the two hand-edit tests exercise the actual guard, not a bypass of
  // it. The admin account itself is created through the service directly:
  // creating the fixture is not what is under test here, the write route
  // and its guard are.
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

  // Same idea as `loginAsNewAdmin`, through `POST /v1/rabbi/login`. The
  // rabbi account cascade-deletes with the rabbi row (see
  // `admin_users_rabbi_id_unique`'s FK), so it needs no cleanup of its own.
  const loginAsRabbi = async (rabbiId: string): Promise<string> => {
    const email = `test-rabbi-account-${uniqueSuffix()}@example.com`;
    const created = await adminRabbiAccountService.create(rabbiId, { email, username: `rabbi-${uniqueSuffix()}` });

    const res = await app.inject({ method: 'POST', url: '/v1/rabbi/login', payload: { identifier: email, password: created.temporaryPassword } });
    assert.equal(res.statusCode, 200);
    const cookie = res.cookies.find((c) => c.name === RABBI_SESSION_COOKIE_NAME);
    if (!cookie) throw new Error('expected the rabbi login route to set a session cookie');
    return `${cookie.name}=${cookie.value}`;
  };

  const createRabbi = async (name: string, honorific: 'rav' | 'rabbanit' = 'rav'): Promise<string> => {
    const id = `test-rabbi-${uniqueSuffix()}`;
    await db.insert(rabbis).values({ id, name, honorific });
    cleanupRabbiIds.add(id);
    return id;
  };

  const jerusalemCode = async (): Promise<number> => {
    const rows = await db.select({ code: cities.code }).from(cities).where(eq(cities.nameHe, SEEDED_CITY_NAME)).limit(1);
    const row = rows[0];
    if (!row) throw new Error('expected the seeded city to exist');
    return row.code;
  };

  const insertExistingImportedLesson = async (options: {
    rabbiId: string;
    place: string;
    weekday: number;
    startTime?: string;
    source: string;
  }): Promise<{ id: string; importKey: string }> => {
    const id = `test-lesson-${uniqueSuffix()}`;
    const importKey = `${options.rabbiId}|w${options.weekday}|${placeKeyOf(options.place)}`;
    await db.insert(lessons).values({
      id,
      rabbiId: options.rabbiId,
      placeName: options.place,
      placeStreet: 'רחוב קיים 1',
      cityCode: await jerusalemCode(),
      audience: 'men',
      recurrenceKind: 'weekly',
      recurrenceWeekdays: [options.weekday],
      startTime: options.startTime ?? '20:00',
      durationMinutes: 60,
      provenance: 'imported',
      importKey,
      importSources: [options.source],
    });
    cleanupLessonIds.add(id);
    return { id, importKey };
  };

  const postPlan = async (file: LessonImportFile) =>
    app.inject({ method: 'POST', url: '/v1/agent/imports/plan', headers: AUTH_HEADER, payload: file });
  const postApply = async (body: Record<string, unknown>) => {
    // Tracked regardless of whether this call actually reaches a
    // successful `apply` (a wrong digest, a busy lock, etc. never write a
    // run row), so `afterEach` always knows every fileSha256 this suite
    // could possibly have produced a run for. Computed the same way the
    // server does: `apply` hashes the *Zod-parsed* file, not the raw
    // request body, and `.parse()` re-serialises an object's keys in the
    // schema's own declared order, which is not always the order a test's
    // literal object was written in (most visibly, a row-level override
    // that adds a key the base row template does not have, e.g.
    // `audience`, gets appended at the end of the raw object but sorted
    // back into place by the schema). Hashing the raw body here once
    // produced a digest that never matched the row `apply` actually wrote,
    // which leaked exactly one `lesson_import_runs` row per suite run.
    const file = body.file;
    if (file) {
      try {
        cleanupRunFileShas.add(sha256Of(JSON.stringify(lessonImportFileSchema.parse(file))));
      } catch {
        // An invalid file never reaches a successful `apply` either; there
        // is nothing it could have written to track.
      }
    }
    return app.inject({ method: 'POST', url: '/v1/agent/imports/apply', headers: AUTH_HEADER, payload: body });
  };
  const postDecision = async (body: Record<string, unknown>) =>
    app.inject({ method: 'POST', url: '/v1/agent/imports/decisions', headers: AUTH_HEADER, payload: body });
  const getRabbis = async (query = '') => app.inject({ method: 'GET', url: `/v1/agent/imports/rabbis${query}`, headers: AUTH_HEADER });

  describe('key guard', () => {
    test('no key gives 401', async () => {
      const res = await app.inject({ method: 'POST', url: '/v1/agent/imports/plan', payload: buildFile([baseRow()]) });
      assert.equal(res.statusCode, 401);
    });

    test('a wrong key gives 401', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/v1/agent/imports/plan',
        headers: { authorization: 'Bearer wrong-key-wrong-key-wrong-key-00' },
        payload: buildFile([baseRow()]),
      });
      assert.equal(res.statusCode, 401);
    });

    test('a real admin session cookie does not open an agent route', async () => {
      const cookie = await loginAsNewAdmin();
      const res = await app.inject({ method: 'POST', url: '/v1/agent/imports/plan', headers: { cookie }, payload: buildFile([baseRow()]) });
      assert.equal(res.statusCode, 401);
    });

    test('the agent key does not open an admin route', async () => {
      const res = await app.inject({ method: 'GET', url: '/v1/admin/rabbis', headers: AUTH_HEADER });
      assert.equal(res.statusCode, 401);
    });

    test('no key configured means 404, not 401: the routes are not registered at all', async () => {
      // Reproduces src/index.ts's own gate for a missing `IMPORT_AGENT_KEY`
      // (`if (config.importAgentKey) await registerAgentRoutes(...)`), not
      // a harness-only shortcut: `undefined` here is what an absent env
      // var would resolve to.
      const appWithoutAgentRoutes = await buildAgentImportTestApp(undefined);
      try {
        const res = await appWithoutAgentRoutes.inject({ method: 'POST', url: '/v1/agent/imports/plan', headers: AUTH_HEADER, payload: buildFile([baseRow()]) });
        assert.equal(res.statusCode, 404);
      } finally {
        await appWithoutAgentRoutes.close();
      }
    });
  });

  test('an invalid rows file gives 400 naming the row and field, and plans nothing', async () => {
    const badFile = { ...buildFile([baseRow()]), rows: [{ rabbiName: 'רב' }] };
    const res = await postPlan(badFile as unknown as LessonImportFile);
    assert.equal(res.statusCode, 400);
    const body = res.json() as { error: string; details: unknown; issues: { path: string; message: string }[] };
    assert.equal(body.error, 'invalid_request');
    assert.ok(body.details);
    // Finding 10: `issues` sits next to `details` (the flattened shape),
    // one entry per failing field, naming the row (by its index path) and
    // the field, so the caller does not have to reconstruct that itself
    // from the flattened shape.
    assert.ok(Array.isArray(body.issues) && body.issues.length > 0);
    assert.ok(body.issues.every((issue) => typeof issue.path === 'string' && typeof issue.message === 'string'));
    assert.ok(body.issues.some((issue) => issue.path.startsWith('rows.0.')));
  });

  test('happy path through a remembered link: mapping and defaults, provenance imported', async () => {
    const source = `remembered-${uniqueSuffix()}.example.com`;
    const rabbiName = `רב זכור ${uniqueSuffix()}`;
    const rabbiId = await createRabbi(rabbiName);
    const nameKey = nameKeyOf(rabbiName);
    cleanupNameKeys.add(nameKey);
    await db.insert(lessonImportRabbiLinks).values({ nameKey, source, rabbiId, decision: 'linked', origin: 'owner' });

    const row = baseRow({ rabbiName, sources: [source], place: `מקום זכור ${uniqueSuffix()}` });
    const file = buildFile([row]);

    const planRes = await postPlan(file);
    assert.equal(planRes.statusCode, 200);
    const planBody = planRes.json() as AgentImportPlanResponse;
    assert.equal(planBody.counts.added, 1);
    assert.equal(planBody.additions.length, 1);
    assert.equal(planBody.additions[0]?.rabbiName, rabbiName);

    const applyRes = await postApply({ file, digest: planBody.digest });
    assert.equal(applyRes.statusCode, 200);
    const applyBody = applyRes.json() as AgentImportApplyResult;
    assert.equal(applyBody.counts.added, 1);

    const lessonRows = await db.select().from(lessons).where(eq(lessons.rabbiId, rabbiId));
    assert.equal(lessonRows.length, 1);
    const lesson = lessonRows[0];
    assert.ok(lesson);
    cleanupLessonIds.add(lesson.id);
    assert.equal(lesson.provenance, 'imported');
    assert.equal(lesson.audience, 'men');
    assert.equal(lesson.recurrenceKind, 'weekly');
    assert.deepEqual(lesson.recurrenceWeekdays, [0]);
  });

  test('the same file applied twice adds and updates nothing the second time', async () => {
    const source = `idempotent-${uniqueSuffix()}.example.com`;
    const rabbiName = `רב יציב ${uniqueSuffix()}`;
    const rabbiId = await createRabbi(rabbiName);
    const nameKey = nameKeyOf(rabbiName);
    cleanupNameKeys.add(nameKey);
    await db.insert(lessonImportRabbiLinks).values({ nameKey, source, rabbiId, decision: 'linked', origin: 'owner' });

    const row = baseRow({ rabbiName, sources: [source], place: `מקום יציב ${uniqueSuffix()}` });
    const file = buildFile([row]);

    const firstPlan = (await postPlan(file)).json() as AgentImportPlanResponse;
    const firstApply = (await postApply({ file, digest: firstPlan.digest })).json() as AgentImportApplyResult;
    assert.equal(firstApply.counts.added, 1);
    const created = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.rabbiId, rabbiId));
    for (const row2 of created) cleanupLessonIds.add(row2.id);

    const secondPlan = (await postPlan(file)).json() as AgentImportPlanResponse;
    assert.equal(secondPlan.counts.added, 0);
    assert.equal(secondPlan.counts.updated, 0);
  });

  // Finding 4 from the review: a lesson's stored `importKey` is frozen at
  // import time and never recomputed from its current text. Before the
  // fix, a hand edit that changed the place text made the lookup miss,
  // and the source's still-original text tried to insert a fresh lesson,
  // breaking the unique index on `import_key` every week.
  test('a row matching an imported_edited lesson\'s original import key is skipped, never breaks the unique index', async () => {
    const rabbiName = `רב מוגן ${uniqueSuffix()}`;
    const rabbiId = await createRabbi(rabbiName);
    const nameKey = nameKeyOf(rabbiName);
    cleanupNameKeys.add(nameKey);
    const source = `frozen-key-${uniqueSuffix()}.example.com`;
    await db.insert(lessonImportRabbiLinks).values({ nameKey, source, rabbiId, decision: 'linked', origin: 'owner' });

    const originalPlace = `מקום מקורי ${uniqueSuffix()}`;
    const { id: lessonId } = await insertExistingImportedLesson({ rabbiId, place: originalPlace, weekday: 0, source });

    const cookie = await loginAsNewAdmin();
    const patchRes = await app.inject({
      method: 'PATCH',
      url: `/v1/admin/lessons/${lessonId}`,
      headers: { cookie },
      payload: {
        rabbiId,
        place: { name: `מקום אחרי עריכה ${uniqueSuffix()}`, street: 'רחוב אחרי עריכה 1', cityCode: await jerusalemCode() },
        audience: 'men',
        recurrence: { kind: 'weekly', weekdays: [0] },
        startTime: '20:00',
        durationMinutes: 60,
      },
    });
    assert.equal(patchRes.statusCode, 200);
    const editedRows = await db.select().from(lessons).where(eq(lessons.id, lessonId));
    assert.equal(editedRows[0]?.provenance, 'imported_edited');

    // The source still reports the row under its original text this week.
    const row = baseRow({ rabbiName, sources: [source], place: originalPlace });
    const file = buildFile([row]);
    const planBody = (await postPlan(file)).json() as AgentImportPlanResponse;
    assert.equal(planBody.counts.added, 0);
    assert.ok(planBody.skipped.some((item) => item.reason === 'matches_existing_lesson'));

    const applyBody = (await postApply({ file, digest: planBody.digest })).json() as AgentImportApplyResult;
    assert.equal(applyBody.counts.added, 0);
  });

  // Finding 5 from the review, and the owner's rule: never two lessons of
  // one rabbi on the same day at the same place. Two rows in one file that
  // land on the same import key both name that slot; the second is
  // skipped, never a second insert that would only fail the unique index,
  // and the key still counts as present (not a candidate for deletion).
  test('two rows with the same import key in one file: the second is skipped as duplicate_in_file', async () => {
    const rabbiName = `רב כפול ${uniqueSuffix()}`;
    const rabbiId = await createRabbi(rabbiName);
    const nameKey = nameKeyOf(rabbiName);
    cleanupNameKeys.add(nameKey);
    const source = `duplicate-key-${uniqueSuffix()}.example.com`;
    await db.insert(lessonImportRabbiLinks).values({ nameKey, source, rabbiId, decision: 'linked', origin: 'owner' });

    const place = `מקום כפול ${uniqueSuffix()}`;
    const rowA = baseRow({ rabbiName, sources: [source], place });
    const rowB = baseRow({ rabbiName, sources: [source], place });
    const file = buildFile([rowA, rowB]);

    const planBody = (await postPlan(file)).json() as AgentImportPlanResponse;
    assert.equal(planBody.counts.added, 1);
    assert.ok(planBody.skipped.some((item) => item.reason === 'duplicate_in_file'));

    const applyBody = (await postApply({ file, digest: planBody.digest })).json() as AgentImportApplyResult;
    assert.equal(applyBody.counts.added, 1);
    const createdLessons = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.rabbiId, rabbiId));
    assert.equal(createdLessons.length, 1);
    for (const row2 of createdLessons) cleanupLessonIds.add(row2.id);
  });

  // Finding 4 from the review: the winner of a same-import-key collision
  // must not depend on file order, or a site that reorders its own rows
  // would flip which lesson survives every week. Applied once in one
  // order, then again in the reversed order: the earliest start time still
  // wins both times, so the second apply is a no-op (0 added, 0 updated),
  // not a flip to the other row's time.
  test('the duplicate-in-file tie-break is independent of row order: reversed order keeps the same lesson', async () => {
    const rabbiName = `רב סדר ${uniqueSuffix()}`;
    const rabbiId = await createRabbi(rabbiName);
    const nameKey = nameKeyOf(rabbiName);
    cleanupNameKeys.add(nameKey);
    const source = `order-independent-${uniqueSuffix()}.example.com`;
    await db.insert(lessonImportRabbiLinks).values({ nameKey, source, rabbiId, decision: 'linked', origin: 'owner' });

    const place = `מקום סדר ${uniqueSuffix()}`;
    const earlyRow = baseRow({ rabbiName, sources: [source], place, startTime: '19:00' });
    const lateRow = baseRow({ rabbiName, sources: [source], place, startTime: '20:30' });

    const firstFile = buildFile([earlyRow, lateRow]);
    const firstPlan = (await postPlan(firstFile)).json() as AgentImportPlanResponse;
    assert.equal(firstPlan.additions[0]?.startTime, '19:00');
    const firstApply = (await postApply({ file: firstFile, digest: firstPlan.digest })).json() as AgentImportApplyResult;
    assert.equal(firstApply.counts.added, 1);
    const createdLessons = await db.select().from(lessons).where(eq(lessons.rabbiId, rabbiId));
    assert.equal(createdLessons.length, 1);
    assert.equal(createdLessons[0]?.startTime, '19:00');
    for (const row2 of createdLessons) cleanupLessonIds.add(row2.id);

    // Same two rows, reversed order: the earliest start time must still
    // win, so this is a no-op against the lesson already created above.
    const secondFile = buildFile([lateRow, earlyRow]);
    const secondPlan = (await postPlan(secondFile)).json() as AgentImportPlanResponse;
    assert.equal(secondPlan.counts.added, 0);
    assert.equal(secondPlan.counts.updated, 0);
    const secondApply = (await postApply({ file: secondFile, digest: secondPlan.digest })).json() as AgentImportApplyResult;
    assert.equal(secondApply.counts.updated, 0);

    const lessonsAfter = await db.select().from(lessons).where(eq(lessons.rabbiId, rabbiId));
    assert.equal(lessonsAfter.length, 1);
    assert.equal(lessonsAfter[0]?.startTime, '19:00');
  });

  test('a new pair with exactly one same-named rabbi links automatically at apply, is reported, and is not asked again', async () => {
    const source = `auto-link-${uniqueSuffix()}.example.com`;
    const rabbiName = `רב יחיד ${uniqueSuffix()}`;
    const rabbiId = await createRabbi(rabbiName);
    const nameKey = nameKeyOf(rabbiName);
    cleanupNameKeys.add(nameKey);

    const row = baseRow({ rabbiName, sources: [source], place: `מקום יחיד ${uniqueSuffix()}` });
    const file = buildFile([row]);

    const planBody = (await postPlan(file)).json() as AgentImportPlanResponse;
    assert.equal(planBody.questions.length, 0);
    assert.equal(planBody.newLinks.length, 1);
    assert.equal(planBody.newLinks[0]?.rabbiId, rabbiId);

    const applyBody = (await postApply({ file, digest: planBody.digest })).json() as AgentImportApplyResult;
    assert.equal(applyBody.newLinks.length, 1);
    const created = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.rabbiId, rabbiId));
    for (const row2 of created) cleanupLessonIds.add(row2.id);

    const linkRows = await db
      .select()
      .from(lessonImportRabbiLinks)
      .where(eq(lessonImportRabbiLinks.nameKey, nameKey));
    assert.equal(linkRows.length, 1);
    assert.equal(linkRows[0]?.origin, 'auto');

    const nextPlan = (await postPlan(buildFile([baseRow({ rabbiName, sources: [source], place: `מקום יחיד2 ${uniqueSuffix()}` })]))).json() as AgentImportPlanResponse;
    assert.equal(nextPlan.questions.length, 0);
    assert.equal(nextPlan.newLinks.length, 0);
  });

  // Finding 1 from the live trial (2026-W38): several rows for the same
  // (nameKey, source) pair each produced their own question or new-link
  // entry (109 question rows for 77 distinct pairs; one link repeated five
  // times). A decision, and a link, are made once per pair, so the plan
  // must group rows into one entry per pair, while `counts.notImported`
  // (and `counts.added`, via the questions turning into additions) stay
  // plain row counts.
  test('several rows for the same (name, source) pair group into one question and one new link, not one per row', async () => {
    const questionRabbiName = `יגאל כהן ${uniqueSuffix()}`;
    const questionSource = `many-rows-question-${uniqueSuffix()}.example.com`;
    await createRabbi(questionRabbiName);
    await createRabbi(questionRabbiName); // two candidates: a question, not an auto-link
    const questionNameKey = nameKeyOf(questionRabbiName);
    cleanupNameKeys.add(questionNameKey);
    const questionRows = [0, 1, 2].map((n) =>
      baseRow({ rabbiName: questionRabbiName, sources: [questionSource], place: `מקום שאלה ${n} ${uniqueSuffix()}` }),
    );

    const linkRabbiName = `רב מקושר ${uniqueSuffix()}`;
    const linkSource = `many-rows-link-${uniqueSuffix()}.example.com`;
    const linkRabbiId = await createRabbi(linkRabbiName); // exactly one candidate: auto-links
    cleanupNameKeys.add(nameKeyOf(linkRabbiName));
    const linkRows = [0, 1, 2].map((n) => baseRow({ rabbiName: linkRabbiName, sources: [linkSource], place: `מקום קישור ${n} ${uniqueSuffix()}` }));

    const file = buildFile([...questionRows, ...linkRows]);
    const planBody = (await postPlan(file)).json() as AgentImportPlanResponse;

    assert.equal(planBody.questions.length, 1);
    assert.equal(planBody.questions[0]?.rows.length, 3);
    assert.equal(planBody.newLinks.length, 1);
    assert.equal(planBody.newLinks[0]?.rabbiId, linkRabbiId);
    // Three rows are questions, three are additions: the row count, not the
    // pair count.
    assert.equal(planBody.counts.notImported, 3);
    assert.equal(planBody.counts.added, 3);

    const applyBody = (await postApply({ file, digest: planBody.digest })).json() as AgentImportApplyResult;
    assert.equal(applyBody.newLinks.length, 1);
    const created = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.rabbiId, linkRabbiId));
    for (const row2 of created) cleanupLessonIds.add(row2.id);
  });

  test('two same-named candidates is a question; a decision on one site leaves the other a question', async () => {
    const rabbiName = `יגאל כהן ${uniqueSuffix()}`;
    const rabbiIdA = await createRabbi(rabbiName);
    const rabbiIdB = await createRabbi(rabbiName);
    const nameKey = nameKeyOf(rabbiName);
    cleanupNameKeys.add(nameKey);

    const sourceA = `site-a-${uniqueSuffix()}.example.com`;
    const sourceB = `site-b-${uniqueSuffix()}.example.com`;
    const rowA = baseRow({ rabbiName, sources: [sourceA], place: `מקום א ${uniqueSuffix()}` });
    const rowB = baseRow({ rabbiName, sources: [sourceB], place: `מקום ב ${uniqueSuffix()}` });

    const planBoth = (await postPlan(buildFile([rowA, rowB]))).json() as AgentImportPlanResponse;
    assert.equal(planBoth.questions.length, 2);
    assert.equal(planBoth.counts.added, 0);

    const decisionRes = await postDecision({ kind: 'link', nameKey, source: sourceA, rabbiId: rabbiIdA });
    assert.equal(decisionRes.statusCode, 200);

    const planAfter = (await postPlan(buildFile([rowA, rowB]))).json() as AgentImportPlanResponse;
    assert.equal(planAfter.counts.added, 1);
    assert.equal(planAfter.additions[0]?.rabbiName, rabbiName);
    assert.equal(planAfter.questions.length, 1);
    assert.equal(planAfter.questions[0]?.source, sourceB);

    const applyAfter = (await postApply({ file: buildFile([rowA, rowB]), digest: planAfter.digest })).json() as AgentImportApplyResult;
    const created = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.rabbiId, rabbiIdA));
    for (const row2 of created) cleanupLessonIds.add(row2.id);
    assert.equal(applyAfter.counts.added, 1);

    const alreadyDecided = await postDecision({ kind: 'link', nameKey, source: sourceA, rabbiId: rabbiIdB });
    assert.equal(alreadyDecided.statusCode, 409);
  });

  // Finding from the live trial: `GET /v1/agent/imports/rabbis` 500'd on
  // real data (a raw `sql`... = any(${ids})`` interpolated the JS array as
  // a tuple, not an array literal; fixed to `inArray`). No test ever
  // called this route with a query that returns rabbis who have lessons,
  // and `plan`'s own candidate loading takes the *unfiltered* branch of
  // the same `loadCitiesByRabbi` (no `rabbiIds` at all), which never
  // reached the broken code path either; only this filtered call site did.
  test('GET /rabbis, with and without q, returns cities for rabbis who have lessons', async () => {
    const rabbiName = `רב ערים ${uniqueSuffix()}`;
    const rabbiId = await createRabbi(rabbiName);
    await insertExistingImportedLesson({
      rabbiId,
      place: `מקום ערים ${uniqueSuffix()}`,
      weekday: 0,
      source: `rabbis-cities-${uniqueSuffix()}.example.com`,
    });

    const withoutQ = await getRabbis();
    assert.equal(withoutQ.statusCode, 200);
    const withoutQBody = withoutQ.json() as { items: { id: string; cities: string[] }[] };
    const foundWithoutQ = withoutQBody.items.find((item) => item.id === rabbiId);
    assert.ok(foundWithoutQ);
    assert.ok(foundWithoutQ?.cities.includes(SEEDED_CITY_NAME));

    const withQ = await getRabbis(`?q=${encodeURIComponent(rabbiName)}`);
    assert.equal(withQ.statusCode, 200);
    const withQBody = withQ.json() as { items: { id: string; cities: string[] }[] };
    const foundWithQ = withQBody.items.find((item) => item.id === rabbiId);
    assert.ok(foundWithQ);
    assert.ok(foundWithQ?.cities.includes(SEEDED_CITY_NAME));
  });

  test('a plan question with two candidates who both have lessons carries each candidate\'s cities', async () => {
    const rabbiName = `יגאל כהן-ערים ${uniqueSuffix()}`;
    const rabbiIdA = await createRabbi(rabbiName);
    const rabbiIdB = await createRabbi(rabbiName);
    const nameKey = nameKeyOf(rabbiName);
    cleanupNameKeys.add(nameKey);
    await insertExistingImportedLesson({ rabbiId: rabbiIdA, place: `מקום א-ערים ${uniqueSuffix()}`, weekday: 0, source: `q-cities-a-${uniqueSuffix()}.example.com` });
    await insertExistingImportedLesson({ rabbiId: rabbiIdB, place: `מקום ב-ערים ${uniqueSuffix()}`, weekday: 0, source: `q-cities-b-${uniqueSuffix()}.example.com` });

    const source = `question-cities-${uniqueSuffix()}.example.com`;
    const row = baseRow({ rabbiName, sources: [source], place: `מקום שאלה-ערים ${uniqueSuffix()}` });
    const planBody = (await postPlan(buildFile([row]))).json() as AgentImportPlanResponse;
    assert.equal(planBody.questions.length, 1);
    const candidates = planBody.questions[0]?.candidates ?? [];
    assert.equal(candidates.length, 2);
    for (const candidate of candidates) {
      assert.ok(candidate.cities.includes(SEEDED_CITY_NAME));
    }
  });

  // Owner decision: the import only ever deals with rabbis, never
  // rabbaniyot. A row whose own text names "הרבנית X" is skipped outright
  // (never even reaches resolution), but still protects an existing
  // lesson at its key like any other skip.
  test('a row naming "הרבנית X" skips as rabbanit_not_imported and protects an existing lesson at its key', async () => {
    const rabbanitName = `הרבנית לא מיובאת ${uniqueSuffix()}`;
    const rabbiId = await createRabbi(rabbanitName.replace('הרבנית ', ''), 'rabbanit');
    const nameKey = nameKeyOf(rabbanitName);
    cleanupNameKeys.add(nameKey);
    const source = `rabbanit-skip-${uniqueSuffix()}.example.com`;
    const place = `מקום לא מיובא ${uniqueSuffix()}`;
    const { id: lessonId } = await insertExistingImportedLesson({ rabbiId, place, weekday: 0, source });

    const row = baseRow({ rabbiName: rabbanitName, sources: [source], place });
    const planBody = (await postPlan(buildFile([row]))).json() as AgentImportPlanResponse;
    assert.ok(planBody.skipped.some((item) => item.reason === 'rabbanit_not_imported'));
    assert.equal(planBody.deletions.length, 0);
    assert.equal(planBody.withheldIfUnacked.length, 0);

    const stillThere = await db.select().from(lessons).where(eq(lessons.id, lessonId));
    assert.equal(stillThere.length, 1);
  });

  // A `link` decision naming a rabbanit as the target is rejected: the
  // import never resolves a name to a rabbanit, not even by hand.
  test('a link decision to a rabbanit gives 400', async () => {
    const rabbanitId = await createRabbi(`הרבנית מטרה ${uniqueSuffix()}`, 'rabbanit');
    const rabbiName = `שם כלשהו-קישור ${uniqueSuffix()}`;
    const nameKey = nameKeyOf(rabbiName);
    cleanupNameKeys.add(nameKey);
    const source = `link-rabbanit-${uniqueSuffix()}.example.com`;
    const res = await postDecision({ kind: 'link', nameKey, source, rabbiId: rabbanitId });
    assert.equal(res.statusCode, 400);
  });

  // A rav's lesson can still be for women (0026 allows it; it is only a
  // rabbanit who is restricted to women only).
  test('a rav with the built-in "נשים" audience imports as a women\'s lesson', async () => {
    const rabbiName = `רב נשים ${uniqueSuffix()}`;
    const rabbiId = await createRabbi(rabbiName, 'rav');
    const nameKey = nameKeyOf(rabbiName);
    cleanupNameKeys.add(nameKey);
    const source = `rav-women-${uniqueSuffix()}.example.com`;
    await db.insert(lessonImportRabbiLinks).values({ nameKey, source, rabbiId, decision: 'linked', origin: 'owner' });

    const row = baseRow({ rabbiName, sources: [source], place: `מקום נשים ${uniqueSuffix()}`, audience: 'נשים' });
    const planBody = (await postPlan(buildFile([row]))).json() as AgentImportPlanResponse;
    assert.equal(planBody.counts.added, 1);
    const applyBody = (await postApply({ file: buildFile([row]), digest: planBody.digest })).json() as AgentImportApplyResult;
    assert.equal(applyBody.counts.added, 1);

    const lessonRows = await db.select().from(lessons).where(eq(lessons.rabbiId, rabbiId));
    assert.equal(lessonRows[0]?.audience, 'women');
    for (const lessonRow of lessonRows) cleanupLessonIds.add(lessonRow.id);
  });

  test('an existing link survives a new rabbi created later with the same name', async () => {
    const rabbiName = `רב קבוע ${uniqueSuffix()}`;
    const source = `survives-${uniqueSuffix()}.example.com`;
    const originalRabbiId = await createRabbi(rabbiName);
    const nameKey = nameKeyOf(rabbiName);
    cleanupNameKeys.add(nameKey);
    await db.insert(lessonImportRabbiLinks).values({ nameKey, source, rabbiId: originalRabbiId, decision: 'linked', origin: 'owner' });

    await createRabbi(rabbiName); // a second, same-named rabbi, created after the link

    const row = baseRow({ rabbiName, sources: [source], place: `מקום קבוע ${uniqueSuffix()}` });
    const planBody = (await postPlan(buildFile([row]))).json() as AgentImportPlanResponse;
    assert.equal(planBody.questions.length, 0);
    assert.equal(planBody.additions[0]?.rabbiName, rabbiName);

    const applyBody = (await postApply({ file: buildFile([row]), digest: planBody.digest })).json() as AgentImportApplyResult;
    assert.equal(applyBody.counts.added, 1);
    const lessonRows = await db.select().from(lessons).where(eq(lessons.rabbiId, originalRabbiId));
    assert.equal(lessonRows.length, 1);
    const lesson = lessonRows[0];
    assert.ok(lesson);
    cleanupLessonIds.add(lesson.id);
  });

  test('a merged row: a link on any of its sources resolves it; conflicting links make it a question', async () => {
    const rabbiName = `רב ממוזג ${uniqueSuffix()}`;
    const rabbiIdA = await createRabbi(rabbiName);
    const rabbiIdB = await createRabbi(rabbiName);
    const nameKey = nameKeyOf(rabbiName);
    cleanupNameKeys.add(nameKey);
    const sourceA = `merge-a-${uniqueSuffix()}.example.com`;
    const sourceB = `merge-b-${uniqueSuffix()}.example.com`;

    await db.insert(lessonImportRabbiLinks).values({ nameKey, source: sourceA, rabbiId: rabbiIdA, decision: 'linked', origin: 'owner' });

    const mergedRow = baseRow({ rabbiName, sources: [sourceA, sourceB], place: `מקום ממוזג ${uniqueSuffix()}` });
    const resolvedFile = buildFile([mergedRow]);
    resolvedFile.sources.push({ domain: sourceB, name: sourceB, url: `https://${sourceB}/`, format: 'html', status: 'ok', rowCount: 1 });

    const planBody = (await postPlan(resolvedFile)).json() as AgentImportPlanResponse;
    assert.equal(planBody.questions.length, 0);
    assert.equal(planBody.additions.length, 1);
    const applyBody = (await postApply({ file: resolvedFile, digest: planBody.digest })).json() as AgentImportApplyResult;
    assert.equal(applyBody.counts.added, 1);
    const created = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.rabbiId, rabbiIdA));
    for (const row2 of created) cleanupLessonIds.add(row2.id);

    // Now a conflicting link on sourceB, for a fresh row/place, makes it a
    // question: one per single source (finding 6), never a joined 'a+b'.
    await db.insert(lessonImportRabbiLinks).values({ nameKey, source: sourceB, rabbiId: rabbiIdB, decision: 'linked', origin: 'owner' });
    const conflictingRow = baseRow({ rabbiName, sources: [sourceA, sourceB], place: `מקום סתירה ${uniqueSuffix()}` });
    const conflictFile = buildFile([conflictingRow]);
    conflictFile.sources.push({ domain: sourceB, name: sourceB, url: `https://${sourceB}/`, format: 'html', status: 'ok', rowCount: 1 });
    const conflictPlan = (await postPlan(conflictFile)).json() as AgentImportPlanResponse;
    assert.equal(conflictPlan.questions.length, 2);
    assert.deepEqual(new Set(conflictPlan.questions.map((question) => question.source)), new Set([sourceA, sourceB]));
    assert.ok(conflictPlan.questions.every((question) => !question.source.includes('+')));
    assert.equal(conflictPlan.counts.added, 0);
  });

  // Finding 6 from the review: `decide` only ever answers one real source
  // at a time, so a question's `source` must never be a joined 'a+b'
  // pseudo-source, and the route must reject one if handed one.
  test('decide rejects a source that is not a single domain', async () => {
    const rabbiName = `שם דחוי ${uniqueSuffix()}`;
    const rabbiId = await createRabbi(rabbiName);
    const nameKey = nameKeyOf(rabbiName);
    cleanupNameKeys.add(nameKey);
    const res = await postDecision({ kind: 'link', nameKey, source: 'site-a.example.com+site-b.example.com', rabbiId });
    assert.equal(res.statusCode, 400);
  });

  test('an ignore decision skips the row, and a new_rabbi decision creates the rabbi (no photo) and its link together', async () => {
    const rabbiName = `רב שידור ${uniqueSuffix()}`;
    const nameKey = nameKeyOf(rabbiName);
    cleanupNameKeys.add(nameKey);
    const source = `ignore-${uniqueSuffix()}.example.com`;

    await postDecision({ kind: 'ignore', nameKey, source, reason: 'שידור בלבד, לא מיוחס לרב בספר' });
    const row = baseRow({ rabbiName, sources: [source], place: `מקום מוזנח ${uniqueSuffix()}` });
    const planBody = (await postPlan(buildFile([row]))).json() as AgentImportPlanResponse;
    assert.equal(planBody.counts.added, 0);
    assert.ok(planBody.skipped.some((item) => item.reason === 'name_ignored'));

    const newRabbiName = `רב חדש ${uniqueSuffix()}`;
    const newNameKey = nameKeyOf(newRabbiName);
    cleanupNameKeys.add(newNameKey);
    // No `honorific` field at all: `new_rabbi` always creates a rav, the
    // import never creates a rabbanit.
    const decisionRes = await postDecision({ kind: 'new_rabbi', nameKey: newNameKey, source, name: newRabbiName });
    assert.equal(decisionRes.statusCode, 200);
    const decisionBody = decisionRes.json() as { newLink?: { rabbiId: string } };
    const newRabbiId = decisionBody.newLink?.rabbiId;
    assert.ok(newRabbiId);
    cleanupRabbiIds.add(newRabbiId as string);

    const newRabbiRows = await db.select().from(rabbis).where(eq(rabbis.id, newRabbiId as string));
    assert.equal(newRabbiRows[0]?.photoUrl, null);
    assert.equal(newRabbiRows[0]?.honorific, 'rav');

    const newRow = baseRow({ rabbiName: newRabbiName, sources: [source], place: `מקום חדש ${uniqueSuffix()}` });
    const newPlan = (await postPlan(buildFile([newRow]))).json() as AgentImportPlanResponse;
    assert.equal(newPlan.questions.length, 0);
    assert.equal(newPlan.counts.added, 1);
    const newApply = (await postApply({ file: buildFile([newRow]), digest: newPlan.digest })).json() as AgentImportApplyResult;
    assert.equal(newApply.counts.added, 1);
    const created = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.rabbiId, newRabbiId as string));
    for (const row2 of created) cleanupLessonIds.add(row2.id);
  });

  // The unique constraint on (nameKey, source) catches a `new_rabbi` (or
  // any decision) taught twice for the same pair; the race between two
  // calls answers the same way, not a 500.
  test('a duplicate new_rabbi decision gives 409', async () => {
    const nameKey = nameKeyOf(`שם חדש-כפול ${uniqueSuffix()}`);
    cleanupNameKeys.add(nameKey);
    const source = `new-rabbi-duplicate-${uniqueSuffix()}.example.com`;
    const first = await postDecision({ kind: 'new_rabbi', nameKey, source, name: `רב כפול ${uniqueSuffix()}` });
    assert.equal(first.statusCode, 200);
    const firstBody = first.json() as { newLink?: { rabbiId: string } };
    if (firstBody.newLink?.rabbiId) cleanupRabbiIds.add(firstBody.newLink.rabbiId);

    const second = await postDecision({ kind: 'new_rabbi', nameKey, source, name: `רב כפול אחר ${uniqueSuffix()}` });
    assert.equal(second.statusCode, 409);
  });

  test('a learned city_alias turns a skipped row into an add; a rule covering a built-in text gives 400', async () => {
    const rabbiName = `רב עירייה ${uniqueSuffix()}`;
    const rabbiId = await createRabbi(rabbiName);
    const nameKey = nameKeyOf(rabbiName);
    cleanupNameKeys.add(nameKey);
    const source = `city-alias-${uniqueSuffix()}.example.com`;
    await db.insert(lessonImportRabbiLinks).values({ nameKey, source, rabbiId, decision: 'linked', origin: 'owner' });

    const madeUpCity = `עיר-לא-קיימת-${uniqueSuffix()}`;
    const row = baseRow({ rabbiName, sources: [source], city: madeUpCity, place: `מקום עירייה ${uniqueSuffix()}` });
    const firstPlan = (await postPlan(buildFile([row]))).json() as AgentImportPlanResponse;
    assert.equal(firstPlan.counts.added, 0);
    assert.ok(firstPlan.skipped.some((item) => item.reason.startsWith('unrecognised_city')));

    const cityCode = await jerusalemCode();
    cleanupRuleMatchTexts.add(madeUpCity);
    const ruleRes = await postDecision({ kind: 'rule', ruleKind: 'city_alias', matchText: madeUpCity, value: { cityCode } });
    assert.equal(ruleRes.statusCode, 200);

    const secondPlan = (await postPlan(buildFile([row]))).json() as AgentImportPlanResponse;
    assert.equal(secondPlan.counts.added, 1);

    const badRuleRes = await postDecision({ kind: 'rule', ruleKind: 'city_alias', matchText: 'ת"א', value: { cityCode } });
    assert.equal(badRuleRes.statusCode, 400);
  });

  // Finding 9 from the review: a `city_alias` rule's code is checked
  // against the real `cities` table at decision time, not only trusted
  // until the first row tries to read it back.
  test('a city_alias rule naming a city code that does not exist gives 400', async () => {
    const res = await postDecision({ kind: 'rule', ruleKind: 'city_alias', matchText: `עיר-דמיונית-${uniqueSuffix()}`, value: { cityCode: 999_999_999 } });
    assert.equal(res.statusCode, 400);
  });

  // The unique constraint on (kind, matchText) catches a rule taught
  // twice; the race between two calls inserting the same pair at once
  // answers the same way, not a 500.
  test('a duplicate rule gives 409', async () => {
    const matchText = `כלל-כפול-${uniqueSuffix()}`;
    cleanupRuleMatchTexts.add(matchText);
    const cityCode = await jerusalemCode();
    const first = await postDecision({ kind: 'rule', ruleKind: 'city_alias', matchText, value: { cityCode } });
    assert.equal(first.statusCode, 200);
    const second = await postDecision({ kind: 'rule', ruleKind: 'city_alias', matchText, value: { cityCode } });
    assert.equal(second.statusCode, 409);
  });

  // A `city_alias` rule's `matchText` is cleaned the same way a row's own
  // city text is (finding 19): taught with a "קריית" spelling, it must be
  // stored (and therefore matched) under the cleaned "קרית" spelling.
  test('a city_alias rule\'s matchText is cleaned before storage', async () => {
    const cityCode = await jerusalemCode();
    const rawMatchText = `קריית-דוגמה-${uniqueSuffix()}`;
    const cleanedMatchText = rawMatchText.replace('קריית', 'קרית');
    cleanupRuleMatchTexts.add(cleanedMatchText);
    const res = await postDecision({ kind: 'rule', ruleKind: 'city_alias', matchText: rawMatchText, value: { cityCode } });
    assert.equal(res.statusCode, 200);

    const ruleRows = await db.select().from(lessonImportRules).where(eq(lessonImportRules.matchText, cleanedMatchText));
    assert.equal(ruleRows.length, 1);
    const rawRows = await db.select().from(lessonImportRules).where(eq(lessonImportRules.matchText, rawMatchText));
    assert.equal(rawRows.length, 0);
  });

  test('place cleanup: a row matching an existing manual lesson creates no new lesson, and lists the difference', async () => {
    const manualPlace = `בית    כנסת   נקי  ${uniqueSuffix()}`;
    const manualLessonId = `test-lesson-${uniqueSuffix()}`;
    await db.insert(lessons).values({
      id: manualLessonId,
      rabbiId: SEEDED_RABBI_ID,
      placeName: manualPlace,
      placeStreet: 'רחוב קיים 5',
      cityCode: await jerusalemCode(),
      audience: 'men',
      recurrenceKind: 'weekly',
      recurrenceWeekdays: [0],
      startTime: '20:00',
      durationMinutes: 60,
      provenance: 'manual',
    });
    cleanupLessonIds.add(manualLessonId);

    const rabbiRows = await db.select({ name: rabbis.name }).from(rabbis).where(eq(rabbis.id, SEEDED_RABBI_ID)).limit(1);
    const rabbiName = rabbiRows[0]?.name as string;
    const source = `place-cleanup-${uniqueSuffix()}.example.com`;
    const row = baseRow({ rabbiName, sources: [source], place: manualPlace.trim().replace(/\s+/g, ' '), weekday: 'ראשון' });
    const planBody = (await postPlan(buildFile([row]))).json() as AgentImportPlanResponse;
    assert.equal(planBody.counts.added, 0);
    assert.ok(planBody.skipped.some((item) => item.reason === 'matches_existing_lesson'));

    const lessonRows = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.rabbiId, SEEDED_RABBI_ID));
    // Only the one manual lesson we inserted for this test, no import duplicate.
    assert.equal(lessonRows.filter((r) => r.id === manualLessonId).length, 1);
  });

  test('a missing row deletes its lesson (and its exceptions)', async () => {
    const rabbiName = `רב נעלם ${uniqueSuffix()}`;
    const rabbiId = await createRabbi(rabbiName);
    const nameKey = nameKeyOf(rabbiName);
    cleanupNameKeys.add(nameKey);
    const source = `vanish-${uniqueSuffix()}.example.com`;
    const place = `מקום נעלם ${uniqueSuffix()}`;

    await db.insert(lessonImportRabbiLinks).values({ nameKey, source, rabbiId, decision: 'linked', origin: 'owner' });
    const row = baseRow({ rabbiName, sources: [source], place });
    const firstPlan = (await postPlan(buildFile([row]))).json() as AgentImportPlanResponse;
    const firstApply = (await postApply({ file: buildFile([row]), digest: firstPlan.digest })).json() as AgentImportApplyResult;
    assert.equal(firstApply.counts.added, 1);
    const created = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.rabbiId, rabbiId));
    const lessonId = created[0]?.id as string;
    cleanupLessonIds.add(lessonId);

    // No FK cascade deletes a lesson's exceptions; `apply` must delete them
    // itself, the same way `admin-lesson.remove` does.
    const [exceptionRow] = await db
      .insert(lessonExceptions)
      .values({ lessonId, date: '2026-09-20', kind: 'cancelled', reason: 'בדיקה' })
      .returning({ id: lessonExceptions.id });
    assert.ok(exceptionRow);

    // A second lesson from the same source, which the next run's file still
    // reports, keeps the sharp-drop ratio at exactly one in two (not over
    // the SHARP_DROP_RATIO stop), so only the genuinely missing lesson is
    // deleted, not withheld.
    const keeperPlace = `מקום נשאר ${uniqueSuffix()}`;
    const { id: keeperId } = await insertExistingImportedLesson({ rabbiId, place: keeperPlace, weekday: 0, source });
    cleanupLessonIds.add(keeperId);

    // Next run: the source reports the keeper row, but not the vanished one.
    const keeperRow = baseRow({ rabbiName, sources: [source], place: keeperPlace });
    const emptyRunFile = buildFile([keeperRow]);
    const secondPlan = (await postPlan(emptyRunFile)).json() as AgentImportPlanResponse;
    assert.equal(secondPlan.deletions.length, 1);
    assert.equal(secondPlan.deletions[0]?.lessonId, lessonId);
    assert.equal(secondPlan.withheldIfUnacked.length, 0);

    const secondApply = (await postApply({ file: emptyRunFile, digest: secondPlan.digest })).json() as AgentImportApplyResult;
    assert.equal(secondApply.deleted.length, 1);
    cleanupLessonIds.delete(lessonId);

    const remaining = await db.select().from(lessons).where(eq(lessons.id, lessonId));
    assert.equal(remaining.length, 0);
    const remainingExceptions = await db.select().from(lessonExceptions).where(eq(lessonExceptions.id, exceptionRow.id));
    assert.equal(remainingExceptions.length, 0);

    const keeperStillThere = await db.select().from(lessons).where(eq(lessons.id, keeperId));
    assert.equal(keeperStillThere.length, 1);
  });

  test('a source with zero rows, or status failed, deletes nothing', async () => {
    const rabbiName = `רב שרד ${uniqueSuffix()}`;
    const rabbiId = await createRabbi(rabbiName);
    const source = `guarded-${uniqueSuffix()}.example.com`;
    const { id: lessonId } = await insertExistingImportedLesson({ rabbiId, place: `מקום שרד ${uniqueSuffix()}`, weekday: 0, source });

    const zeroRowFile = buildFile([], {});
    zeroRowFile.sources = [{ domain: source, name: source, url: `https://${source}/`, format: 'html', status: 'ok', rowCount: 0 }];
    const zeroPlan = (await postPlan(zeroRowFile)).json() as AgentImportPlanResponse;
    assert.equal(zeroPlan.deletions.length, 0);
    assert.equal(zeroPlan.withheldIfUnacked.length, 0);

    const failedFile = buildFile([], {});
    failedFile.sources = [{ domain: source, name: source, url: `https://${source}/`, format: 'html', status: 'failed', failureReason: 'structure changed', rowCount: 0 }];
    const failedPlan = (await postPlan(failedFile)).json() as AgentImportPlanResponse;
    assert.equal(failedPlan.deletions.length, 0);
    assert.equal(failedPlan.withheldIfUnacked.length, 0);

    const stillThere = await db.select().from(lessons).where(eq(lessons.id, lessonId));
    assert.equal(stillThere.length, 1);
  });

  test('a sharp drop withholds that source\'s deletions until acked', async () => {
    const rabbiId = await createRabbi(`רב ירידה ${uniqueSuffix()}`);
    const source = `sharp-drop-${uniqueSuffix()}.example.com`;
    const survivorPlace = `מקום שורד ${uniqueSuffix()}`;
    const survivorRow = baseRow({ rabbiName: 'שם כלשהו', sources: [source], place: survivorPlace, weekday: 'שני' });

    const lessonsToDelete = await Promise.all(
      [0, 1, 2].map((n) => insertExistingImportedLesson({ rabbiId, place: `מקום יורד ${n} ${uniqueSuffix()}`, weekday: 3, source })),
    );
    // A fourth, surviving lesson matching the one row the file still reports.
    const survivorNameKey = nameKeyOf('שם כלשהו');
    cleanupNameKeys.add(survivorNameKey);
    await db.insert(lessonImportRabbiLinks).values({ nameKey: survivorNameKey, source, rabbiId, decision: 'linked', origin: 'owner' });

    const file = buildFile([survivorRow]);
    const planBody = (await postPlan(file)).json() as AgentImportPlanResponse;
    assert.equal(planBody.deletions.length, 0);
    assert.equal(planBody.withheldIfUnacked.length, 3);
    assert.ok(planBody.withheldIfUnacked.every((item) => item.reason === 'sharp_drop'));

    const applyNoAck = (await postApply({ file, digest: planBody.digest })).json() as AgentImportApplyResult;
    assert.equal(applyNoAck.deleted.length, 0);
    assert.equal(applyNoAck.withheld.length, 3);
    // The stop only withholds this source's deletions; the rest of the run
    // (the survivor row itself, a genuine addition) still applies.
    assert.equal(applyNoAck.counts.added, 1);
    const survivorLessons = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.placeName, survivorPlace));
    for (const r of survivorLessons) cleanupLessonIds.add(r.id);

    const rePlan = (await postPlan(file)).json() as AgentImportPlanResponse;
    const applyAcked = (await postApply({ file, digest: rePlan.digest, acks: [source] })).json() as AgentImportApplyResult;
    assert.equal(applyAcked.deleted.length, 3);
    assert.equal(applyAcked.withheld.length, 0);

    for (const { id } of lessonsToDelete) {
      const remaining = await db.select().from(lessons).where(eq(lessons.id, id));
      assert.equal(remaining.length, 0);
    }
  });

  // Finding 18 from the review: a merged lesson's withheld deletion is
  // released only once every source that actually caused the hold is
  // acked, not just any one of the lesson's sources. sourceX has only this
  // one lesson (a 100% drop, triggers); sourceY has two others that
  // survive (a 1-in-3 drop, does not trigger), so acking sourceY alone
  // must not release it.
  test('a withheld deletion on a lesson with two sources is released only once every causing source is acked', async () => {
    const rabbiId = await createRabbi(`רב ריבוי-מקורות ${uniqueSuffix()}`);
    const sourceX = `multi-source-x-${uniqueSuffix()}.example.com`;
    const sourceY = `multi-source-y-${uniqueSuffix()}.example.com`;

    const mergedPlace = `מקום ממוזג-מקורות ${uniqueSuffix()}`;
    const mergedImportKey = `${rabbiId}|w0|${placeKeyOf(mergedPlace)}`;
    await db.insert(lessons).values({
      id: `test-lesson-${uniqueSuffix()}`,
      rabbiId,
      placeName: mergedPlace,
      placeStreet: 'רחוב קיים 1',
      cityCode: await jerusalemCode(),
      audience: 'men',
      recurrenceKind: 'weekly',
      recurrenceWeekdays: [0],
      startTime: '20:00',
      durationMinutes: 60,
      provenance: 'imported',
      importKey: mergedImportKey,
      importSources: [sourceX, sourceY],
    });
    const mergedRows = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.importKey, mergedImportKey));
    const mergedLessonId = mergedRows[0]?.id as string;
    cleanupLessonIds.add(mergedLessonId);

    // Two more sourceY lessons that survive (Y's own drop stays under the
    // ratio), each matched by a keeper row this week.
    const keeperNameKey = nameKeyOf('שם קבוע ריבוי');
    cleanupNameKeys.add(keeperNameKey);
    await db.insert(lessonImportRabbiLinks).values({ nameKey: keeperNameKey, source: sourceY, rabbiId, decision: 'linked', origin: 'owner' });
    const keeperRows = await Promise.all(
      [0, 1].map(async (n) => {
        const place = `מקום קבוע ריבוי ${n} ${uniqueSuffix()}`;
        await insertExistingImportedLesson({ rabbiId, place, weekday: 1, source: sourceY });
        return baseRow({ rabbiName: 'שם קבוע ריבוי', sources: [sourceY], place, weekday: 'שני' });
      }),
    );

    // An unrelated new row on sourceX, only so sourceX has an actual row
    // this week (the zero-row guard would otherwise protect it outright).
    const otherRabbiId = await createRabbi(`רב ריבוי-נוסף ${uniqueSuffix()}`);
    const otherRabbiRows = await db.select({ name: rabbis.name }).from(rabbis).where(eq(rabbis.id, otherRabbiId)).limit(1);
    const otherRabbiName = otherRabbiRows[0]?.name as string;
    cleanupNameKeys.add(nameKeyOf(otherRabbiName));
    const otherRow = baseRow({ rabbiName: otherRabbiName, sources: [sourceX], place: `מקום ריבוי-נוסף ${uniqueSuffix()}` });

    const file = buildFile([...keeperRows, otherRow]);
    file.sources = [
      { domain: sourceX, name: sourceX, url: `https://${sourceX}/`, format: 'html', status: 'ok', rowCount: 1 },
      { domain: sourceY, name: sourceY, url: `https://${sourceY}/`, format: 'html', status: 'ok', rowCount: 2 },
    ];

    const planBody = (await postPlan(file)).json() as AgentImportPlanResponse;
    const withheld = planBody.withheldIfUnacked.find((item) => item.lessonId === mergedLessonId);
    assert.ok(withheld);
    assert.deepEqual(withheld?.causingSources, [sourceX]);

    // Acking only sourceY (not a causing source) must not release it.
    const applyWrongAck = (await postApply({ file, digest: planBody.digest, acks: [sourceY] })).json() as AgentImportApplyResult;
    assert.ok(!applyWrongAck.deleted.some((item) => item.lessonId === mergedLessonId));
    const stillWithheldRows = await db.select().from(lessons).where(eq(lessons.id, mergedLessonId));
    assert.equal(stillWithheldRows.length, 1);

    // The unrelated row's own addition is created by the apply above; track
    // it for cleanup only now that it actually exists.
    const otherCreated = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.rabbiId, otherRabbiId));
    for (const r of otherCreated) cleanupLessonIds.add(r.id);

    // Acking the actual causing source releases it.
    const rePlan = (await postPlan(file)).json() as AgentImportPlanResponse;
    const applyRightAck = (await postApply({ file, digest: rePlan.digest, acks: [sourceX] })).json() as AgentImportApplyResult;
    assert.ok(applyRightAck.deleted.some((item) => item.lessonId === mergedLessonId));
    cleanupLessonIds.delete(mergedLessonId);
    const deletedRows = await db.select().from(lessons).where(eq(lessons.id, mergedLessonId));
    assert.equal(deletedRows.length, 0);
  });

  test('more than 10 deletions in one run withholds all of them until acked', async () => {
    const rabbiId = await createRabbi(`רב עומס ${uniqueSuffix()}`);
    const source = `threshold-${uniqueSuffix()}.example.com`;
    const created = await Promise.all(
      Array.from({ length: 11 }, (_, n) => insertExistingImportedLesson({ rabbiId, place: `מקום עומס ${n} ${uniqueSuffix()}`, weekday: 4, source })),
    );

    // The zero-row guard now counts a source's *actual* rows in the file
    // (finding 11), never its declared `rowCount`, so `source` needs a real
    // surviving row here too, or its 11 lessons would be protected as
    // "a genuinely zero-row source", never reaching the threshold at all.
    const keeperPlace = `מקום נשאר-עומס ${uniqueSuffix()}`;
    const { id: keeperId } = await insertExistingImportedLesson({ rabbiId, place: keeperPlace, weekday: 5, source });
    const keeperNameKey = nameKeyOf('שם קבוע עומס');
    cleanupNameKeys.add(keeperNameKey);
    await db.insert(lessonImportRabbiLinks).values({ nameKey: keeperNameKey, source, rabbiId, decision: 'linked', origin: 'owner' });
    const keeperRow = baseRow({ rabbiName: 'שם קבוע עומס', sources: [source], place: keeperPlace, weekday: 'שישי' });

    // An unrelated new row on a different source in the same file, to
    // prove the stop only withholds deletions and the rest of the run
    // still applies.
    const otherRabbiId = await createRabbi(`רב עומס-נוסף ${uniqueSuffix()}`);
    const otherRabbiRows = await db.select({ name: rabbis.name }).from(rabbis).where(eq(rabbis.id, otherRabbiId)).limit(1);
    const otherRabbiName = otherRabbiRows[0]?.name as string;
    cleanupNameKeys.add(nameKeyOf(otherRabbiName));
    const otherSource = `threshold-other-${uniqueSuffix()}.example.com`;
    const otherRow = baseRow({ rabbiName: otherRabbiName, sources: [otherSource], place: `מקום עומס-נוסף ${uniqueSuffix()}` });

    const emptyFile = buildFile([keeperRow, otherRow], {});
    emptyFile.sources = [
      { domain: source, name: source, url: `https://${source}/`, format: 'html', status: 'ok', rowCount: 1 },
      { domain: otherSource, name: otherSource, url: `https://${otherSource}/`, format: 'html', status: 'ok', rowCount: 1 },
    ];
    const planBody = (await postPlan(emptyFile)).json() as AgentImportPlanResponse;
    assert.equal(planBody.deletions.length, 0);
    assert.equal(planBody.withheldIfUnacked.length, 11);
    assert.ok(planBody.withheldIfUnacked.every((item) => item.reason === 'over_threshold'));

    const applyNoAck = (await postApply({ file: emptyFile, digest: planBody.digest })).json() as AgentImportApplyResult;
    assert.equal(applyNoAck.deleted.length, 0);
    assert.equal(applyNoAck.counts.added, 1);
    const otherCreated = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.rabbiId, otherRabbiId));
    for (const r of otherCreated) cleanupLessonIds.add(r.id);

    const rePlan = (await postPlan(emptyFile)).json() as AgentImportPlanResponse;
    const applyAcked = (await postApply({ file: emptyFile, digest: rePlan.digest, acks: [source] })).json() as AgentImportApplyResult;
    assert.equal(applyAcked.deleted.length, 11);

    for (const { id } of created) {
      const remaining = await db.select().from(lessons).where(eq(lessons.id, id));
      assert.equal(remaining.length, 0);
    }
    const keeperStillThere = await db.select().from(lessons).where(eq(lessons.id, keeperId));
    assert.equal(keeperStillThere.length, 1);
    cleanupLessonIds.add(keeperId);
  });

  test('an undecided row keeps its lesson alive and is not imported', async () => {
    const rabbiName = `דו משמעי ${uniqueSuffix()}`;
    const rabbiIdA = await createRabbi(rabbiName);
    const rabbiIdB = await createRabbi(rabbiName);
    const nameKey = nameKeyOf(rabbiName);
    cleanupNameKeys.add(nameKey);
    const source = `undecided-${uniqueSuffix()}.example.com`;
    const place = `מקום דו משמעי ${uniqueSuffix()}`;

    const { id: lessonId } = await insertExistingImportedLesson({ rabbiId: rabbiIdA, place, weekday: 0, source });

    const row = baseRow({ rabbiName, sources: [source], place });
    const file = buildFile([row]);
    const planBody = (await postPlan(file)).json() as AgentImportPlanResponse;
    assert.equal(planBody.questions.length, 1);
    const candidateIds = planBody.questions[0]?.candidates.map((candidate) => candidate.id) ?? [];
    assert.ok(candidateIds.includes(rabbiIdA) && candidateIds.includes(rabbiIdB));
    assert.equal(planBody.deletions.length, 0);
    assert.equal(planBody.withheldIfUnacked.length, 0);
    assert.equal(planBody.counts.notImported, 1);

    const stillThere = await db.select().from(lessons).where(eq(lessons.id, lessonId));
    assert.equal(stillThere.length, 1);

    // A question never blocks apply; the lesson must still be there
    // afterwards, not just at plan time.
    const applyBody = (await postApply({ file, digest: planBody.digest, acks: [source] })).json() as AgentImportApplyResult;
    assert.equal(applyBody.deleted.length, 0);
    const stillThereAfterApply = await db.select().from(lessons).where(eq(lessons.id, lessonId));
    assert.equal(stillThereAfterApply.length, 1);
  });

  test('a digest mismatch gives 409 plan_changed and writes nothing', async () => {
    const rabbiName = `רב דיגסט ${uniqueSuffix()}`;
    const rabbiId = await createRabbi(rabbiName);
    const nameKey = nameKeyOf(rabbiName);
    cleanupNameKeys.add(nameKey);
    const source = `digest-${uniqueSuffix()}.example.com`;
    await db.insert(lessonImportRabbiLinks).values({ nameKey, source, rabbiId, decision: 'linked', origin: 'owner' });

    const row = baseRow({ rabbiName, sources: [source], place: `מקום דיגסט ${uniqueSuffix()}` });
    const file = buildFile([row]);
    const res = await postApply({ file, digest: 'obviously-wrong-digest' });
    assert.equal(res.statusCode, 409);
    assert.equal((res.json() as { error: string }).error, 'plan_changed');

    const lessonRows = await db.select().from(lessons).where(eq(lessons.rabbiId, rabbiId));
    assert.equal(lessonRows.length, 0);
  });

  test('a lesson hand-deleted through the real admin route is not recreated', async () => {
    const rabbiName = `רב נמחק ${uniqueSuffix()}`;
    const rabbiId = await createRabbi(rabbiName);
    const nameKey = nameKeyOf(rabbiName);
    cleanupNameKeys.add(nameKey);
    const source = `hand-delete-${uniqueSuffix()}.example.com`;
    await db.insert(lessonImportRabbiLinks).values({ nameKey, source, rabbiId, decision: 'linked', origin: 'owner' });

    const place = `מקום נמחק ${uniqueSuffix()}`;
    const row = baseRow({ rabbiName, sources: [source], place });
    const file = buildFile([row]);
    const firstPlan = (await postPlan(file)).json() as AgentImportPlanResponse;
    await postApply({ file, digest: firstPlan.digest });
    const created = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.rabbiId, rabbiId));
    const lessonId = created[0]?.id as string;

    const cookie = await loginAsNewAdmin();
    const deleteRes = await app.inject({ method: 'DELETE', url: `/v1/admin/lessons/${lessonId}`, headers: { cookie } });
    assert.equal(deleteRes.statusCode, 204);

    const importKey = `${rabbiId}|w0|${placeKeyOf(place)}`;
    cleanupImportKeys.add(importKey);
    const dismissed = await db.select().from(lessonImportDismissedKeys).where(eq(lessonImportDismissedKeys.importKey, importKey));
    assert.equal(dismissed.length, 1);

    const secondPlan = (await postPlan(file)).json() as AgentImportPlanResponse;
    assert.equal(secondPlan.counts.added, 0);
    assert.ok(secondPlan.skipped.some((item) => item.reason === 'hand_deleted'));
  });

  test('a lesson hand-deleted through the real rabbi route is not recreated', async () => {
    const rabbiName = `רב נמחק-עצמי ${uniqueSuffix()}`;
    const rabbiId = await createRabbi(rabbiName);
    const nameKey = nameKeyOf(rabbiName);
    cleanupNameKeys.add(nameKey);
    const source = `rabbi-hand-delete-${uniqueSuffix()}.example.com`;
    await db.insert(lessonImportRabbiLinks).values({ nameKey, source, rabbiId, decision: 'linked', origin: 'owner' });

    const place = `מקום נמחק-עצמי ${uniqueSuffix()}`;
    const row = baseRow({ rabbiName, sources: [source], place });
    const file = buildFile([row]);
    const firstPlan = (await postPlan(file)).json() as AgentImportPlanResponse;
    await postApply({ file, digest: firstPlan.digest });
    const created = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.rabbiId, rabbiId));
    const lessonId = created[0]?.id as string;

    const cookie = await loginAsRabbi(rabbiId);
    const deleteRes = await app.inject({ method: 'DELETE', url: `/v1/rabbi/lessons/${lessonId}`, headers: { cookie } });
    assert.equal(deleteRes.statusCode, 204);

    const importKey = `${rabbiId}|w0|${placeKeyOf(place)}`;
    cleanupImportKeys.add(importKey);
    const dismissed = await db.select().from(lessonImportDismissedKeys).where(eq(lessonImportDismissedKeys.importKey, importKey));
    assert.equal(dismissed.length, 1);

    const secondPlan = (await postPlan(file)).json() as AgentImportPlanResponse;
    assert.equal(secondPlan.counts.added, 0);
    assert.ok(secondPlan.skipped.some((item) => item.reason === 'hand_deleted'));
  });

  test('a hand edit through the real admin route protects the lesson from the next import', async () => {
    const rabbiName = `רב עריכה ${uniqueSuffix()}`;
    const rabbiId = await createRabbi(rabbiName);
    const nameKey = nameKeyOf(rabbiName);
    cleanupNameKeys.add(nameKey);
    const source = `admin-edit-${uniqueSuffix()}.example.com`;
    await db.insert(lessonImportRabbiLinks).values({ nameKey, source, rabbiId, decision: 'linked', origin: 'owner' });

    const place = `מקום עריכה ${uniqueSuffix()}`;
    const row = baseRow({ rabbiName, sources: [source], place });
    const file = buildFile([row]);
    const firstPlan = (await postPlan(file)).json() as AgentImportPlanResponse;
    await postApply({ file, digest: firstPlan.digest });
    const created = await db.select().from(lessons).where(eq(lessons.rabbiId, rabbiId));
    const lesson = created[0];
    assert.ok(lesson);
    cleanupLessonIds.add(lesson.id);
    assert.equal(lesson.provenance, 'imported');

    // The guard's wiring is where it fails: a real admin session, PATCHing
    // the real route, not a direct service call.
    const cookie = await loginAsNewAdmin();
    const patchRes = await app.inject({
      method: 'PATCH',
      url: `/v1/admin/lessons/${lesson.id}`,
      headers: { cookie },
      payload: {
        rabbiId,
        place: { name: lesson.placeName, street: 'רחוב חדש 9', cityCode: lesson.cityCode },
        audience: 'men',
        recurrence: { kind: 'weekly', weekdays: [0] },
        startTime: '21:00',
        durationMinutes: 60,
      },
    });
    assert.equal(patchRes.statusCode, 200);

    const editedRows = await db.select().from(lessons).where(eq(lessons.id, lesson.id));
    assert.equal(editedRows[0]?.provenance, 'imported_edited');

    const secondPlan = (await postPlan(file)).json() as AgentImportPlanResponse;
    assert.equal(secondPlan.counts.added, 0);
    assert.equal(secondPlan.counts.updated, 0);
    assert.ok(secondPlan.skipped.some((item) => item.reason === 'matches_existing_lesson'));
  });

  test('a hand edit through the real rabbi route protects the lesson from the next import', async () => {
    const rabbiName = `רב עריכה-עצמית ${uniqueSuffix()}`;
    const rabbiId = await createRabbi(rabbiName);
    const nameKey = nameKeyOf(rabbiName);
    cleanupNameKeys.add(nameKey);
    const source = `rabbi-edit-${uniqueSuffix()}.example.com`;
    await db.insert(lessonImportRabbiLinks).values({ nameKey, source, rabbiId, decision: 'linked', origin: 'owner' });

    const place = `מקום עריכה-עצמית ${uniqueSuffix()}`;
    const row = baseRow({ rabbiName, sources: [source], place });
    const file = buildFile([row]);
    const firstPlan = (await postPlan(file)).json() as AgentImportPlanResponse;
    await postApply({ file, digest: firstPlan.digest });
    const created = await db.select().from(lessons).where(eq(lessons.rabbiId, rabbiId));
    const lesson = created[0];
    assert.ok(lesson);
    cleanupLessonIds.add(lesson.id);
    assert.equal(lesson.provenance, 'imported');

    // Same guard, from the rabbi's own panel: a real rabbi session, PATCHing
    // his own lesson through the real route.
    const cookie = await loginAsRabbi(rabbiId);
    const patchRes = await app.inject({
      method: 'PATCH',
      url: `/v1/rabbi/lessons/${lesson.id}`,
      headers: { cookie },
      payload: {
        place: { name: lesson.placeName, street: 'רחוב חדש עצמי 3', cityCode: lesson.cityCode },
        audience: 'men',
        recurrence: { kind: 'weekly', weekdays: [0] },
        startTime: '21:30',
        durationMinutes: 60,
      },
    });
    assert.equal(patchRes.statusCode, 200);

    const editedRows = await db.select().from(lessons).where(eq(lessons.id, lesson.id));
    assert.equal(editedRows[0]?.provenance, 'imported_edited');

    const secondPlan = (await postPlan(file)).json() as AgentImportPlanResponse;
    assert.equal(secondPlan.counts.added, 0);
    assert.equal(secondPlan.counts.updated, 0);
    assert.ok(secondPlan.skipped.some((item) => item.reason === 'matches_existing_lesson'));
  });

  test('the run row records counts, deleted snapshots, withheld deletions, and new links', async () => {
    // Source A: two existing lessons, the file still reports one of them
    // (a plain deletion, at exactly the sharp-drop ratio, not over it).
    const sourceA = `run-row-a-${uniqueSuffix()}.example.com`;
    const rabbiIdA = await createRabbi(`רב ריצה א ${uniqueSuffix()}`);
    const keeperPlace = `מקום נשאר-ריצה ${uniqueSuffix()}`;
    await insertExistingImportedLesson({ rabbiId: rabbiIdA, place: keeperPlace, weekday: 1, source: sourceA });
    const { id: deletedLessonId } = await insertExistingImportedLesson({ rabbiId: rabbiIdA, place: `מקום נעלם-ריצה ${uniqueSuffix()}`, weekday: 1, source: sourceA });
    const keeperNameKey = nameKeyOf('שם קבוע ריצה');
    cleanupNameKeys.add(keeperNameKey);
    await db.insert(lessonImportRabbiLinks).values({ nameKey: keeperNameKey, source: sourceA, rabbiId: rabbiIdA, decision: 'linked', origin: 'owner' });
    const keeperRow = baseRow({ rabbiName: 'שם קבוע ריצה', sources: [sourceA], place: keeperPlace, weekday: 'שני' });

    // Source B: three existing lessons, the file still reports one of
    // them. Deleting the other two is two thirds, over the sharp-drop
    // ratio, so those two are withheld, not plainly deleted. (Zero actual
    // rows for a source protects it entirely, per finding 11, so a
    // withheld-deletion scenario needs at least one surviving row too.)
    const sourceB = `run-row-b-${uniqueSuffix()}.example.com`;
    const rabbiIdB = await createRabbi(`רב ריצה ב ${uniqueSuffix()}`);
    const keeperPlaceB = `מקום נשאר-ריצה-ב ${uniqueSuffix()}`;
    await insertExistingImportedLesson({ rabbiId: rabbiIdB, place: keeperPlaceB, weekday: 2, source: sourceB });
    const { id: withheldLessonId } = await insertExistingImportedLesson({ rabbiId: rabbiIdB, place: `מקום מוחזק-ריצה-1 ${uniqueSuffix()}`, weekday: 2, source: sourceB });
    const { id: withheldLessonId2 } = await insertExistingImportedLesson({ rabbiId: rabbiIdB, place: `מקום מוחזק-ריצה-2 ${uniqueSuffix()}`, weekday: 2, source: sourceB });
    const keeperNameKeyB = nameKeyOf('שם קבוע ריצה ב');
    cleanupNameKeys.add(keeperNameKeyB);
    await db.insert(lessonImportRabbiLinks).values({ nameKey: keeperNameKeyB, source: sourceB, rabbiId: rabbiIdB, decision: 'linked', origin: 'owner' });
    const keeperRowB = baseRow({ rabbiName: 'שם קבוע ריצה ב', sources: [sourceB], place: keeperPlaceB, weekday: 'שלישי' });

    // A brand-new rabbi (auto-linked), for the `newLinks` entry.
    const sourceC = `run-row-c-${uniqueSuffix()}.example.com`;
    const newLinkRabbiId = await createRabbi(`רב חדש-ריצה ${uniqueSuffix()}`);
    const newLinkRabbiRows = await db.select({ name: rabbis.name }).from(rabbis).where(eq(rabbis.id, newLinkRabbiId)).limit(1);
    const newLinkRabbiName = newLinkRabbiRows[0]?.name as string;
    cleanupNameKeys.add(nameKeyOf(newLinkRabbiName));
    const newLinkRow = baseRow({ rabbiName: newLinkRabbiName, sources: [sourceC], place: `מקום חדש-ריצה ${uniqueSuffix()}`, weekday: 'רביעי' });

    const file = buildFile([keeperRow, keeperRowB, newLinkRow]);
    file.sources = [
      { domain: sourceA, name: sourceA, url: `https://${sourceA}/`, format: 'html', status: 'ok', rowCount: 1 },
      { domain: sourceB, name: sourceB, url: `https://${sourceB}/`, format: 'html', status: 'ok', rowCount: 1 },
      { domain: sourceC, name: sourceC, url: `https://${sourceC}/`, format: 'html', status: 'ok', rowCount: 1 },
    ];

    const planBody = (await postPlan(file)).json() as AgentImportPlanResponse;
    assert.equal(planBody.deletions.length, 1);
    assert.equal(planBody.withheldIfUnacked.length, 2);
    assert.equal(planBody.newLinks.length, 1);

    const applyBody = (await postApply({ file, digest: planBody.digest, acks: [sourceB] })).json() as AgentImportApplyResult;
    assert.equal(applyBody.counts.added, 1);
    const created = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.rabbiId, newLinkRabbiId));
    for (const r of created) cleanupLessonIds.add(r.id);

    const runRows = await db
      .select()
      .from(lessonImportRuns)
      .where(eq(lessonImportRuns.fileSha256, sha256Of(JSON.stringify(lessonImportFileSchema.parse(file)))));
    const runRow = runRows.at(-1);
    assert.ok(runRow);
    assert.equal(runRow?.week, file.week);
    assert.equal((runRow?.counts as { added: number }).added, 1);

    const deletedSnapshot = runRow?.deleted as { lessonId?: string }[];
    assert.ok(deletedSnapshot.some((item) => item.lessonId === deletedLessonId));
    assert.ok(deletedSnapshot.some((item) => item.lessonId === withheldLessonId));
    assert.ok(deletedSnapshot.some((item) => item.lessonId === withheldLessonId2));

    const withheldSnapshot = runRow?.withheld as { lessonId?: string }[];
    assert.equal(withheldSnapshot.length, 0);

    const newLinksSnapshot = runRow?.newLinks as { rabbiId?: string }[];
    assert.ok(newLinksSnapshot.some((item) => item.rabbiId === newLinkRabbiId));
  });

  test('busy: apply while the advisory lock is held by another transaction gives 409 import_busy', async () => {
    const rabbiName = `רב עומס-ריצה ${uniqueSuffix()}`;
    const rabbiId = await createRabbi(rabbiName);
    const nameKey = nameKeyOf(rabbiName);
    cleanupNameKeys.add(nameKey);
    const source = `busy-${uniqueSuffix()}.example.com`;
    await db.insert(lessonImportRabbiLinks).values({ nameKey, source, rabbiId, decision: 'linked', origin: 'owner' });
    const row = baseRow({ rabbiName, sources: [source], place: `מקום עומס-ריצה ${uniqueSuffix()}` });
    const file = buildFile([row]);
    const planBody = (await postPlan(file)).json() as AgentImportPlanResponse;

    // Deterministic, not a race between two concurrent requests: this
    // transaction takes the exact lock `apply` needs (blocking, not
    // `pg_try_...`) and holds it open, so the real `apply` call below is
    // guaranteed to find it taken.
    await sqlWithBegin.begin(async (sql) => {
      await sql`select pg_advisory_xact_lock(${IMPORT_ADVISORY_LOCK_KEY})`;
      const res = await postApply({ file, digest: planBody.digest });
      assert.equal(res.statusCode, 409);
      assert.equal((res.json() as { error: string }).error, 'import_busy');
    });

    // Now that the lock is released, the same plan applies cleanly.
    const rePlan = (await postPlan(file)).json() as AgentImportPlanResponse;
    const applied = (await postApply({ file, digest: rePlan.digest })).json() as AgentImportApplyResult;
    assert.equal(applied.counts.added, 1);
    const created = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.rabbiId, rabbiId));
    for (const r of created) cleanupLessonIds.add(r.id);
  });

  describe('pure helpers', () => {
    // A real pair, not `placeKeyOf(x) === toSlug(x)` (circular: placeKeyOf
    // is toSlug, so that only proves a function equals itself). Two
    // differently-spaced, differently-punctuated spellings of the same
    // venue must key the same lesson.
    test('placeKeyOf keys two differently-written spellings of the same venue the same way', () => {
      assert.equal(placeKeyOf('בית   הכנסת  "מוסאיוף" '), placeKeyOf('בית הכנסת מוסאיוף'));
    });

    test('resolveWeekday maps the procedure\'s vocabulary onto Weekday', () => {
      assert.equal(resolveWeekday('ראשון'), 0);
      assert.equal(resolveWeekday('שבת קודש'), 6);
      assert.equal(resolveWeekday('מוצ"ש'), 6);
      assert.equal(resolveWeekday('יום שלא קיים'), undefined);
    });

    // Finding 3 from the live trial (2026-W38): "שישי וערבי חג" was skipped
    // as an unknown weekday; the plan maps it to Friday, with a note.
    test('"שישי וערבי חג" maps to Friday, with a note', () => {
      assert.equal(resolveWeekday('שישי וערבי חג'), 5);
      assert.ok(resolveWeekdayNote('שישי וערבי חג'));
    });

    // Finding 2 from the live trial: "תל אביב" and "ירושלים (פסגת זאב)"
    // were skipped as unrecognised cities. The built-in alias must point at
    // the spelling actually in the local `cities` table ('תל אביב - יפו',
    // confirmed against the seeded data, not assumed), and cleanup must
    // drop a trailing parenthetical and normalise "קריית" to "קרית".
    test('city cleanup and built-in aliases match the real cities table', () => {
      assert.equal(resolveBuiltInCityAlias('תל אביב'), 'תל אביב - יפו');
      assert.equal(cleanCityText('ירושלים (פסגת זאב)'), 'ירושלים');
      assert.equal(cleanCityText('קריית מוצקין'), 'קרית מוצקין');
    });

    // Finding 4 from the live trial: "גברים בלבד" was skipped as an
    // unknown audience; the plan maps it to `men`.
    test('"גברים בלבד" maps to the men audience', () => {
      assert.equal(BUILT_IN_AUDIENCE_ALIASES['גברים בלבד'], 'men');
    });

    // A real pair, not `nameKeyOf(x)` against a copy of its own body: two
    // different raw spellings of the same rabbi's name (with and without
    // the honorific, with different spacing) must key the same.
    test('nameKeyOf keys "הרב אברהם כהן" the same as "אברהם   כהן"', () => {
      assert.equal(nameKeyOf('הרב אברהם כהן'), nameKeyOf('אברהם   כהן'));
      assert.equal(nameKeyOf('הרב אברהם כהן'), stripLeadingHonorific('הרב אברהם כהן'));
    });
  });
});
