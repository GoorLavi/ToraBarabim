import type { FastifyInstance, FastifyReply } from 'fastify';

import { toHomeResponse } from '../../convertors/home';
import * as homeService from '../../service/home/home';

const GENERIC_ERROR_MESSAGE = 'אירעה שגיאה בשרת, נסו שוב מאוחר יותר';

const handleError = (reply: FastifyReply, error: unknown): FastifyReply => {
  reply.request.log.error({ err: error }, 'unhandled error in GET /v1/home');
  return reply.status(500).send({ error: 'internal_error', message: GENERIC_ERROR_MESSAGE });
};

export const registerHomeRoutes = async (app: FastifyInstance): Promise<void> => {
  // No query parameters: the server decides every row, its order, and its
  // contents, so there is nothing here for a client to request by hand.
  app.get('/v1/home', async (_request, reply) => {
    try {
      const result = await homeService.getHome(new Date());
      return reply.send(toHomeResponse(result));
    } catch (error) {
      return handleError(reply, error);
    }
  });
};
