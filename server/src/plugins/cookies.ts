import cookie from '@fastify/cookie';
import type { FastifyInstance } from 'fastify';

export const registerCookies = async (app: FastifyInstance, secret: string): Promise<void> => {
  await app.register(cookie, { secret });
};
