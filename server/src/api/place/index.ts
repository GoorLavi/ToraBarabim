import type { FastifyInstance } from 'fastify';

import { registerPlaceLessonRoutes } from './lessons';
import { registerPlaceProfileRoutes } from './profile';

// Registers the place self-service route groups (login is the shared
// panel door, `POST /v1/panel/login`; logout/me are out of scope here, see
// the rabbi panel's own `api/rabbi/auth` for that shape if it is ever
// needed for a place).
export const registerPlacePortalRoutes = async (app: FastifyInstance): Promise<void> => {
  await registerPlaceProfileRoutes(app);
  await registerPlaceLessonRoutes(app);
};
