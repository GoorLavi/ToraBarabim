import type { FastifyInstance } from 'fastify';

import { registerRabbiLessonExceptionRoutes } from './lesson-exceptions';
import { registerRabbiLessonRoutes } from './lessons';
import { registerRabbiProfileRoutes } from './profile';

// Registers the rabbi self-service route groups (auth is registered
// separately by index.ts, matching the admin auth/admin route split).
export const registerRabbiRoutes = async (app: FastifyInstance): Promise<void> => {
  await registerRabbiProfileRoutes(app);
  await registerRabbiLessonRoutes(app);
  await registerRabbiLessonExceptionRoutes(app);
};
