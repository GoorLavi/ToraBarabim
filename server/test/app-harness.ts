import { readdir } from 'node:fs/promises';

import Fastify, { type FastifyInstance } from 'fastify';

import { registerCityRoutes } from '../src/api/cities';
import { registerHealthRoutes } from '../src/api/health';
import { registerHomeRoutes } from '../src/api/home';
import { registerLessonRoutes } from '../src/api/lessons';
import { registerRabbiDirectoryRoutes } from '../src/api/rabbis';
import { db } from '../src/db/client';
import { registerErrorHandler } from '../src/plugins/error-handler';
import { CLIENT_BUILD_DIR, registerSsr } from '../src/plugins/ssr';

// `db`'s exported type (`server/src/db/client.ts`) is annotated as
// `PostgresJsDatabase`, which omits `$client`, but drizzle-orm's postgres-js
// adapter always attaches the underlying `postgres` client under that key at
// runtime. Needed here only to ping the database and to close the pool so
// `node --test` can exit on its own.
type RawPostgresClient = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<unknown>;
export const rawClient = (db as unknown as { $client: RawPostgresClient & { end: (options?: { timeout?: number }) => Promise<void> } }).$client;

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
  await registerRabbiDirectoryRoutes(app);
  await registerSsr(app);
  registerErrorHandler(app);
  return app;
};
