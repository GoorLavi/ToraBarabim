import type { FastifyInstance } from 'fastify';

import { registerAgentImportRoutes } from './imports';

export const registerAgentRoutes = async (app: FastifyInstance, agentKey: string): Promise<void> => {
  await registerAgentImportRoutes(app, agentKey);
};
