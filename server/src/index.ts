import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import Fastify from 'fastify';

import { registerAdminRoutes } from './api/admin';
import { registerAdminAuthRoutes } from './api/admin/auth';
import { registerCityRoutes } from './api/cities';
import { registerHealthRoutes } from './api/health';
import { registerHomeRoutes } from './api/home';
import { registerLessonRoutes } from './api/lessons';
import { loadConfig } from './config';
import { registerCookies } from './plugins/cookies';
import { registerCors } from './plugins/cors';
import { registerErrorHandler } from './plugins/error-handler';

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
  await registerHealthRoutes(app);
  await registerLessonRoutes(app);
  await registerHomeRoutes(app);
  await registerCityRoutes(app);
  await registerAdminAuthRoutes(app);
  await registerAdminRoutes(app);
  registerErrorHandler(app);

  try {
    await app.listen({ port: config.port, host: config.host });
  } catch (error) {
    app.log.error({ err: error }, 'failed to start server');
    process.exit(1);
  }
};

void start();
