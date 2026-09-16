import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import Fastify from 'fastify';

import { registerAdminRoutes } from './api/admin';
import { registerAdminAuthRoutes } from './api/admin/auth';
import { registerAgentRoutes } from './api/agent';
import { registerAreaRoutes } from './api/areas';
import { registerCityRoutes } from './api/cities';
import { registerHealthRoutes } from './api/health';
import { registerHomeRoutes } from './api/home';
import { registerLessonRoutes } from './api/lessons';
import { registerRabbiRoutes } from './api/rabbi';
import { registerRabbiAuthRoutes } from './api/rabbi/auth';
import { registerRabbiDirectoryRoutes } from './api/rabbis';
import { loadConfig } from './config';
import { registerCookies } from './plugins/cookies';
import { registerCors } from './plugins/cors';
import { registerEmptyBodySupport } from './plugins/empty-body';
import { registerErrorHandler } from './plugins/error-handler';
import { registerSsr } from './plugins/ssr';

const config = loadConfig(process.env);

const app = Fastify({
  logger: {
    level: config.logLevel,
    redact: {
      paths: ['req.headers.authorization', 'req.headers.cookie'],
      censor: '[redacted]',
    },
    transport:
      process.env.NODE_ENV === 'production'
        ? undefined
        : { target: 'pino-pretty', options: { translateTime: 'HH:MM:ss', ignore: 'pid,hostname' } },
  },
});

const start = async (): Promise<void> => {
  await registerCors(app, config.corsOrigins);
  await registerCookies(app, config.sessionSecret);
  // Scoped per-route below (the login route only); global here would rate
  // limit every endpoint, including the public search.
  await app.register(rateLimit, { global: false });
  // No global limits: the rabbi photo route passes its own per-request
  // `fileSize` limit from config, so the plugin default never applies.
  await app.register(multipart);
  // After multipart, so its own parser keeps precedence over the catch-all.
  registerEmptyBodySupport(app);
  await registerHealthRoutes(app);
  await registerLessonRoutes(app);
  await registerHomeRoutes(app);
  await registerCityRoutes(app);
  await registerAreaRoutes(app);
  await registerRabbiDirectoryRoutes(app);
  await registerAdminAuthRoutes(app);
  await registerAdminRoutes(app);
  await registerRabbiAuthRoutes(app);
  await registerRabbiRoutes(app);
  // Fail closed: with no `IMPORT_AGENT_KEY` configured, the whole agent
  // import surface is unregistered, not merely unauthenticated, so a
  // request to it 404s exactly as if the routes did not exist.
  if (config.importAgentKey) await registerAgentRoutes(app, config.importAgentKey);
  // Last: its own route is a catch-all, so every `/v1/*` route above must
  // already be registered. Fastify still matches those exactly regardless of
  // registration order, but registering the wildcard last keeps this file
  // reading as "the API, then the app that renders around it".
  await registerSsr(app);
  registerErrorHandler(app);

  try {
    await app.listen({ port: config.port, host: config.host });
  } catch (error) {
    app.log.error({ err: error }, 'failed to start server');
    process.exit(1);
  }
};

void start();
