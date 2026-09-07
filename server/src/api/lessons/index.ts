import type { FastifyInstance, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

import { toLessonOccurrence, toLessonSearchResponse } from '../../convertors/lesson';
import { InvalidDateRangeError, LessonNotFoundError, LessonOccurrenceNotFoundError } from '../../service/lesson/errors';
import * as lessonService from '../../service/lesson/lesson';
import { lessonOccurrenceParamsSchema, lessonSearchQuerySchema } from '../../service/lesson/models';

const GENERIC_ERROR_MESSAGE = 'אירעה שגיאה בשרת, נסו שוב מאוחר יותר';

const handleError = (reply: FastifyReply, error: unknown, routeLabel: string): FastifyReply => {
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

  // A missing lesson and a lesson with no occurrence on the requested date
  // are the same 404 to the caller: the lesson page shows one "not found"
  // screen either way.
  if (error instanceof LessonNotFoundError || error instanceof LessonOccurrenceNotFoundError) {
    return reply.status(404).send({
      error: 'lesson_occurrence_not_found',
      message: 'השיעור המבוקש לא נמצא',
    });
  }

  reply.request.log.error({ err: error }, `unhandled error in ${routeLabel}`);
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
      return handleError(reply, error, 'GET /v1/lessons');
    }
  });

  app.get('/v1/lessons/:lessonId/occurrences/:date', async (request, reply) => {
    try {
      const { lessonId, date } = lessonOccurrenceParamsSchema.parse(request.params);
      const occurrence = await lessonService.getOccurrence(lessonId, date);
      return reply.send(toLessonOccurrence(occurrence));
    } catch (error) {
      return handleError(reply, error, 'GET /v1/lessons/:lessonId/occurrences/:date');
    }
  });
};
