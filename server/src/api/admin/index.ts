import type { FastifyInstance } from 'fastify';

import { registerAdminUserRoutes } from './admin-users';
import { registerAdminLessonExceptionRoutes } from './lesson-exceptions';
import { registerAdminLessonRoutes } from './lessons';
import { registerAdminPlaceAccountRoutes } from './place-accounts';
import { registerAdminPlaceRoutes } from './places';
import { registerAdminRabbiAccountRoutes } from './rabbi-accounts';
import { registerAdminRabbiRoutes } from './rabbis';

// Registers the admin CRUD route groups (auth is registered separately by
// index.ts, unchanged from slice 2).
export const registerAdminRoutes = async (app: FastifyInstance): Promise<void> => {
  await registerAdminRabbiRoutes(app);
  await registerAdminRabbiAccountRoutes(app);
  await registerAdminPlaceRoutes(app);
  await registerAdminPlaceAccountRoutes(app);
  await registerAdminUserRoutes(app);
  await registerAdminLessonRoutes(app);
  await registerAdminLessonExceptionRoutes(app);
};
