import type { FastifyInstance } from 'fastify';

import { registerAdminLessonExceptionRoutes } from './lesson-exceptions';
import { registerAdminLessonRoutes } from './lessons';
import { registerAdminPlaceRoutes } from './places';
import { registerAdminRabbiRoutes } from './rabbis';

// Registers the four admin CRUD route groups (auth is registered
// separately by index.ts, unchanged from slice 2).
export const registerAdminRoutes = async (app: FastifyInstance): Promise<void> => {
  await registerAdminRabbiRoutes(app);
  await registerAdminPlaceRoutes(app);
  await registerAdminLessonRoutes(app);
  await registerAdminLessonExceptionRoutes(app);
};
