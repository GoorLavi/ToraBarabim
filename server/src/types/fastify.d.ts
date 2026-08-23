import type { AdminUser, RabbiSessionUser } from '@torabarabim/common';

declare module 'fastify' {
  interface FastifyRequest {
    adminUser?: AdminUser;
    rabbiUser?: RabbiSessionUser;
  }
}
