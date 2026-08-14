import cors from '@fastify/cors';
import type { FastifyInstance } from 'fastify';

export const registerCors = async (app: FastifyInstance, origins: string[]): Promise<void> => {
  await app.register(cors, { origin: origins });
};
