import type { FastifyInstance, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

import { toLessonSearchResponse } from '../../convertors/lesson';
import { InvalidDateRangeError } from '../../service/lesson/errors';
import * as lessonService from '../../service/lesson/lesson';
import { lessonSearchQuerySchema } from '../../service/lesson/models';

const GENERIC_ERROR_MESSAGE = 'אירעה שגיאה בשרת, נסו שוב מאוחר יותר';

const handleError = (reply: FastifyReply, error: unknown): FastifyReply => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: 'invalid_request',
      message: 'הבקשה אינה תקינה',
      details: error.flatten(),
    });
  }

  if (error instanceof InvalidDateRangeError) {
    return reply.status(400).send({
      error: 'invalid_date_range',
      message: 'טווח התאריכים שהתבקש אינו תקין',
    });
  }

  reply.request.log.error({ err: error }, 'unhandled error in GET /v1/lessons');
  return reply.status(500).send({ error: 'internal_error', message: GENERIC_ERROR_MESSAGE });
};

export const registerLessonRoutes = async (app: FastifyInstance): Promise<void> => {
  app.get('/v1/lessons', async (request, reply) => {
    try {
      // Parsed by hand, not via the route's schema option, so a real ZodError reaches handleError below.
      const query = lessonSearchQuerySchema.parse(request.query);
      const result = await lessonService.search(query, new Date());
      return reply.send(toLessonSearchResponse(result));
    } catch (error) {
      return handleError(reply, error);
    }
  });
};
