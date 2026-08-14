import type { AdminUser } from '@torabarabim/common';

declare module 'fastify' {
  interface FastifyRequest {
    adminUser?: AdminUser;
  }
}
