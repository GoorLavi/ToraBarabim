import type { FastifyInstance, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

import { toPlaceLessonListResponse, toPlaceLessonResponse } from '../../../convertors/place-lesson';
import { requirePlaceAuth } from '../../../plugins/place-guard';
import * as placeLessonService from '../../../service/place-portal/lesson';
import { LessonNotFoundError, ReferencedRabbiNotFoundError } from '../../../service/place-portal/errors';
import { createPlaceLessonSchema, lessonIdParamSchema, placeLessonListQuerySchema, updatePlaceLessonSchema } from '../../../service/place-portal/models';
import { RabbanitAudienceMustBeWomenError } from '../../../service/shared/errors';

const GENERIC_ERROR_MESSAGE = 'אירעה שגיאה בשרת, נסו שוב מאוחר יותר';
const LESSON_NOT_FOUND_MESSAGE = 'השיעור המבוקש לא נמצא';

const handleError = (reply: FastifyReply, error: unknown, routeLabel: string): FastifyReply => {
  if (error instanceof ZodError) {
    return reply.status(400).send({ error: 'invalid_request', message: 'הבקשה אינה תקינה', details: error.flatten() });
  }

  // A lesson that exists but is held at another place maps to the exact
  // same 404 as a lesson that does not exist at all: see the comment on
  // `LessonNotFoundError` (0015's precedent for a rabbi) for why this must
  // never be a 403.
  if (error instanceof LessonNotFoundError) {
    return reply.status(404).send({ error: 'not_found', message: LESSON_NOT_FOUND_MESSAGE });
  }

  if (error instanceof ReferencedRabbiNotFoundError) {
    return reply.status(400).send({ error: 'unknown_rabbi', message: `הרב שנבחר אינו קיים: '${error.rabbiId}'` });
  }

  if (error instanceof RabbanitAudienceMustBeWomenError) {
    return reply.status(400).send({ error: 'rabbanit_audience_must_be_women', message: 'לרבנית אפשר לשמור רק שיעור לנשים' });
  }

  reply.request.log.error({ err: error }, `unhandled error in ${routeLabel}`);
  return reply.status(500).send({ error: 'internal_error', message: GENERIC_ERROR_MESSAGE });
};

// Create and edit only: a place never deletes a lesson, and never cancels
// or moves a single date (`lesson_exceptions` stays address-only, so no
// route here ever touches it).
export const registerPlaceLessonRoutes = async (app: FastifyInstance): Promise<void> => {
  app.get('/v1/place/lessons', { preHandler: requirePlaceAuth }, async (request, reply) => {
    try {
      if (!request.placeUser) return reply;
      const query = placeLessonListQuerySchema.parse(request.query);
      const result = await placeLessonService.list(request.placeUser.placeId, query);
      return reply.send(toPlaceLessonListResponse(result));
    } catch (error) {
      return handleError(reply, error, 'GET /v1/place/lessons');
    }
  });

  app.get('/v1/place/lessons/:id', { preHandler: requirePlaceAuth }, async (request, reply) => {
    try {
      if (!request.placeUser) return reply;
      const { id } = lessonIdParamSchema.parse(request.params);
      const record = await placeLessonService.getOwnById(request.placeUser.placeId, id);
      return reply.send(toPlaceLessonResponse(record));
    } catch (error) {
      return handleError(reply, error, 'GET /v1/place/lessons/:id');
    }
  });

  app.post('/v1/place/lessons', { preHandler: requirePlaceAuth }, async (request, reply) => {
    try {
      if (!request.placeUser) return reply;
      const body = createPlaceLessonSchema.parse(request.body);
      const record = await placeLessonService.create(request.placeUser.placeId, body);
      return reply.status(201).send(toPlaceLessonResponse(record));
    } catch (error) {
      return handleError(reply, error, 'POST /v1/place/lessons');
    }
  });

  app.patch('/v1/place/lessons/:id', { preHandler: requirePlaceAuth }, async (request, reply) => {
    try {
      if (!request.placeUser) return reply;
      const { id } = lessonIdParamSchema.parse(request.params);
      const body = updatePlaceLessonSchema.parse(request.body);
      const record = await placeLessonService.update(request.placeUser.placeId, id, body);
      return reply.send(toPlaceLessonResponse(record));
    } catch (error) {
      return handleError(reply, error, 'PATCH /v1/place/lessons/:id');
    }
  });
};
