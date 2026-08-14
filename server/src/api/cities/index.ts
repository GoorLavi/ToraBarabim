import type { FastifyInstance, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

import { toCityList } from '../../convertors/city';
import * as cityService from '../../service/city/city';
import { citySearchQuerySchema } from '../../service/city/models';

const GENERIC_ERROR_MESSAGE = 'אירעה שגיאה בשרת, נסו שוב מאוחר יותר';

const handleError = (reply: FastifyReply, error: unknown): FastifyReply => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: 'invalid_request',
      message: 'הבקשה אינה תקינה',
      details: error.flatten(),
    });
  }

  reply.request.log.error({ err: error }, 'unhandled error in GET /v1/cities');
  return reply.status(500).send({ error: 'internal_error', message: GENERIC_ERROR_MESSAGE });
};

export const registerCityRoutes = async (app: FastifyInstance): Promise<void> => {
  app.get('/v1/cities', async (request, reply) => {
    try {
      const query = citySearchQuerySchema.parse(request.query);
      const result = await cityService.search(query);
      return reply.send(toCityList(result));
    } catch (error) {
      return handleError(reply, error);
    }
  });
};
