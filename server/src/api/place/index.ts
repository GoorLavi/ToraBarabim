import type { FastifyInstance } from 'fastify';

import { registerPlaceAuthRoutes } from './auth';
import { registerPlaceLessonRoutes } from './lessons';
import { registerPlaceProfileRoutes } from './profile';

// Registers the place self-service route groups (login is the shared
// panel door, `POST /v1/panel/login`; logout/me mirror `api/rabbi/auth`).
export const registerPlacePortalRoutes = async (app: FastifyInstance): Promise<void> => {
  await registerPlaceAuthRoutes(app);
  await registerPlaceProfileRoutes(app);
  await registerPlaceLessonRoutes(app);
};
