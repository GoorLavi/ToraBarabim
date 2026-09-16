import type { FastifyInstance, FastifyReply } from 'fastify';

import { toWomenAreaResponse } from '../../convertors/women-area';
import * as homeService from '../../service/home/home';

const GENERIC_ERROR_MESSAGE = 'אירעה שגיאה בשרת, נסו שוב מאוחר יותר';

const handleError = (reply: FastifyReply, error: unknown): FastifyReply => {
  reply.request.log.error({ err: error }, 'unhandled error in GET /v1/women');
  return reply.status(500).send({ error: 'internal_error', message: GENERIC_ERROR_MESSAGE });
};

export const registerWomenAreaRoutes = async (app: FastifyInstance): Promise<void> => {
  // No query parameters: like `GET /v1/home` (0012), the server decides the
  // whole summary; the page's own lesson search goes through `GET
  // /v1/lessons?scope=women` instead.
  app.get('/v1/women', async (_request, reply) => {
    try {
      const result = await homeService.getWomenArea(new Date());
      return reply.send(toWomenAreaResponse(result));
    } catch (error) {
      return handleError(reply, error);
    }
  });
};
