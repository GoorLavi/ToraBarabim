import { readdir } from 'node:fs/promises';

import Fastify, { type FastifyInstance } from 'fastify';
import type postgres from 'postgres';

import { registerAdminRoutes } from '../src/api/admin';
import { registerAdminAuthRoutes } from '../src/api/admin/auth';
import { registerAgentRoutes } from '../src/api/agent';
import { registerCityRoutes } from '../src/api/cities';
import { registerHealthRoutes } from '../src/api/health';
import { registerHomeRoutes } from '../src/api/home';
import { registerLessonRoutes } from '../src/api/lessons';
import { registerPanelAuthRoutes } from '../src/api/panel/auth';
import { registerPlacePortalRoutes } from '../src/api/place';
import { registerPlaceRoutes } from '../src/api/places';
import { registerRabbiRoutes } from '../src/api/rabbi';
import { registerRabbiAuthRoutes } from '../src/api/rabbi/auth';
import { registerRabbiDirectoryRoutes } from '../src/api/rabbis';
import { registerWomenAreaRoutes } from '../src/api/women';
import { loadConfig } from '../src/config';
import { db } from '../src/db/client';
import { registerCookies } from '../src/plugins/cookies';
import { registerEmptyBodySupport } from '../src/plugins/empty-body';
import { registerErrorHandler } from '../src/plugins/error-handler';
import { CLIENT_BUILD_DIR, registerSsr } from '../src/plugins/ssr';

// `db`'s exported type (`server/src/db/client.ts`) is annotated as
// `PostgresJsDatabase`, which omits `$client`, but drizzle-orm's postgres-js
// adapter always attaches the underlying `postgres` client under that key at
// runtime. Exported as the real `postgres.Sql` type (not a hand-rolled
// subset), so a caller gets the whole client: tagged-template queries,
// `.end()` to let `node --test` exit on its own, and `.begin()` for a test
// that needs to hold a real transaction open (see agent-import.test.ts's
// busy-lock test).
export const rawClient = (db as unknown as { $client: postgres.Sql }).$client;

// A missing or unreachable database must fail the whole suite loudly, with a
// fix in hand, rather than have every test time out or fail with an opaque
// connection error one at a time.
export const assertDatabaseReachable = async (): Promise<void> => {
  try {
    await rawClient`select 1`;
  } catch (cause) {
    throw new Error(
      'Expected a reachable, seeded Postgres at DATABASE_URL for this suite. ' +
        'Run `npm run db:up && npm run db:migrate -w server && npm run db:seed -w server` first.',
      { cause },
    );
  }
};

// A missing or empty client build must fail the whole suite loudly, with a
// fix in hand, the same way `assertDatabaseReachable` does for Postgres:
// `/health`'s render probe needs the real SSR plugin mounted (see
// `buildApp`), and that plugin serves this build's output.
export const assertClientBuilt = async (): Promise<void> => {
  try {
    const entries = await readdir(CLIENT_BUILD_DIR);
    if (entries.length === 0) throw new Error('client build directory is empty');
  } catch (cause) {
    throw new Error(
      `Expected a built client at ${CLIENT_BUILD_DIR}. Run \`npm run build -w client\` first.`,
      { cause },
    );
  }
};

// Mirrors the public routes `src/index.ts` registers, minus what a browser
// needs (CORS, cookies, multipart, rate limiting) and everything behind
// auth: none of that is reachable through `app.inject`, and it is not part
// of the public surface this suite exists to protect.
//
// The SSR plugin is the one exception: it is mounted last, exactly as
// `src/index.ts` does, because `/health`'s render probe (`app.inject`
// against `HEALTH_RENDER_PROBE_PATH`) must hit the real catch-all route.
// Without it, the probe path matches nothing, Fastify answers its own
// default 404, and the health check would pass without ever proving
// rendering works, which is the one failure it exists to catch. The cost is
// real: this suite now needs a client build to run, and loads the client's
// compiled server bundle once. Accepted because a health test that cannot
// fail when rendering is broken is not a test.
export const buildApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({ logger: false });
  await registerHealthRoutes(app);
  await registerLessonRoutes(app);
  await registerHomeRoutes(app);
  await registerCityRoutes(app);
  await registerPlaceRoutes(app);
  await registerRabbiDirectoryRoutes(app);
  await registerWomenAreaRoutes(app);
  await registerSsr(app);
  registerErrorHandler(app);
  return app;
};

// A second app, for `agent-import.test.ts` only: the agent import routes,
// plus the admin and rabbi routes the hand-edit and dismiss-on-delete
// tests write through. No SSR catch-all: this suite never needs it, and
// skipping it keeps this builder independent of a client build.
//
// `agentKey` is required, not read from config internally, so a caller can
// pass `undefined` explicitly to reproduce `src/index.ts`'s own gate
// (`if (config.importAgentKey) await registerAgentRoutes(...)`) for an
// absent key: the agent group is then never registered at all, and a
// request to it 404s exactly as it would in production, rather than
// 401ing from a guard that is still mounted.
export const buildAgentImportTestApp = async (agentKey: string | undefined): Promise<FastifyInstance> => {
  const config = loadConfig(process.env);

  const app = Fastify({ logger: false });
  await registerCookies(app, config.sessionSecret);
  registerEmptyBodySupport(app);
  await registerAdminAuthRoutes(app);
  await registerAdminRoutes(app);
  await registerPanelAuthRoutes(app);
  await registerRabbiAuthRoutes(app);
  await registerRabbiRoutes(app);
  if (agentKey) await registerAgentRoutes(app, agentKey);
  registerErrorHandler(app);
  return app;
};

// A third app, for `admin-api.test.ts` only: cookies, the admin auth and
// admin CRUD routes, nothing else. No rabbi routes, no agent import, no
// SSR catch-all: this suite exercises the admin lesson occurrences route
// and its guard, not the rest of the admin surface's own tests.
export const buildAdminTestApp = async (): Promise<FastifyInstance> => {
  const config = loadConfig(process.env);

  const app = Fastify({ logger: false });
  await registerCookies(app, config.sessionSecret);
  registerEmptyBodySupport(app);
  await registerAdminAuthRoutes(app);
  await registerAdminRoutes(app);
  registerErrorHandler(app);
  return app;
};

// A fourth app, for `place-api.test.ts` only: cookies, the shared panel
// login door, the place portal's own routes, and the public rabbi
// directory (`GET /v1/rabbis`, the rabbi picker's server-side search).
// Every fixture (the place, its account) is built through the admin-place
// service directly, not through the admin routes, so this app carries none
// of the admin route group: what is under test here is the place guard,
// the place portal write path, and the directory search a place's rabbi
// picker depends on, not the admin surface that provisions it.
export const buildPlaceTestApp = async (): Promise<FastifyInstance> => {
  const config = loadConfig(process.env);

  const app = Fastify({ logger: false });
  await registerCookies(app, config.sessionSecret);
  registerEmptyBodySupport(app);
  await registerPanelAuthRoutes(app);
  await registerPlacePortalRoutes(app);
  await registerRabbiDirectoryRoutes(app);
  registerErrorHandler(app);
  return app;
};
