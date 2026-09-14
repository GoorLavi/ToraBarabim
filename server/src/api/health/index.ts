import { readdir } from 'node:fs/promises';

import type { FastifyInstance } from 'fastify';

import { CLIENT_BUILD_DIR } from '../../plugins/ssr';
import { HEALTH_RENDER_PROBE_PATH } from './consts';

const hasClientAssets = async (): Promise<boolean> => {
  try {
    const entries = await readdir(CLIENT_BUILD_DIR);
    return entries.length > 0;
  } catch {
    return false;
  }
};

// The ECS container health check and the ALB target health check both read
// this response alone: it decides whether a task is promoted as healthy and
// whether the deployment circuit breaker rolls back. A plain liveness check
// would let a task with a missing or broken client bundle pass and serve
// dead pages with nothing to trigger a rollback, so this proves the server
// can actually render one.
//
// It must never depend on the database: a data outage would otherwise
// restart every task in a loop and turn a degraded site into no site at
// all. `HEALTH_RENDER_PROBE_PATH` renders only the layout (no loader) and
// the catch-all 404 route (a loader that just sets a status), so neither
// half of this check touches it.
export const registerHealthRoutes = async (app: FastifyInstance): Promise<void> => {
  app.get('/health', async (_request, reply) => {
    if (!(await hasClientAssets())) {
      app.log.error({ clientBuildDir: CLIENT_BUILD_DIR }, 'health check: client asset directory missing or empty');
      return reply.status(503).send({ status: 'error' as const });
    }

    const probe = await app.inject({ method: 'GET', url: HEALTH_RENDER_PROBE_PATH });
    if (probe.statusCode !== 404) {
      app.log.error({ statusCode: probe.statusCode }, 'health check: render probe did not return 404');
      return reply.status(503).send({ status: 'error' as const });
    }

    return { status: 'ok' as const };
  });
};
