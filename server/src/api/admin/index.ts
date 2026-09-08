import type { FastifyInstance } from 'fastify';

import { registerAdminUserRoutes } from './admin-users';
import { registerAdminLessonExceptionRoutes } from './lesson-exceptions';
import { registerAdminLessonRoutes } from './lessons';
import { registerAdminRabbiAccountRoutes } from './rabbi-accounts';
import { registerAdminRabbiRoutes } from './rabbis';

// Registers the admin CRUD route groups (auth is registered separately by
// index.ts, unchanged from slice 2). There is no places group: a venue is
// free text on a lesson, not an entity with its own admin screen.
export const registerAdminRoutes = async (app: FastifyInstance): Promise<void> => {
  await registerAdminRabbiRoutes(app);
  await registerAdminRabbiAccountRoutes(app);
  await registerAdminUserRoutes(app);
  await registerAdminLessonRoutes(app);
  await registerAdminLessonExceptionRoutes(app);
};
