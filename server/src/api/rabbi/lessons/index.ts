import type { RabbiOccurrenceListResponse } from '@torabarabim/common';
import type { FastifyInstance, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

import { toRabbiLessonListResponse, toRabbiLessonResponse } from '../../../convertors/rabbi-lesson';
import { requireRabbiAuth } from '../../../plugins/rabbi-guard';
import { LessonNotFoundError, UnknownCityError } from '../../../service/rabbi-lesson/errors';
import { createRabbiLessonSchema, lessonIdParamSchema, rabbiLessonListQuerySchema, updateRabbiLessonSchema } from '../../../service/rabbi-lesson/models';
import * as rabbiLessonService from '../../../service/rabbi-lesson/rabbi-lesson';

const GENERIC_ERROR_MESSAGE = 'אירעה שגיאה בשרת, נסו שוב מאוחר יותר';
const LESSON_NOT_FOUND_MESSAGE = 'השיעור המבוקש לא נמצא';

const handleError = (reply: FastifyReply, error: unknown, routeLabel: string): FastifyReply => {
  if (error instanceof ZodError) {
    return reply.status(400).send({ error: 'invalid_request', message: 'הבקשה אינה תקינה', details: error.flatten() });
  }

  // A lesson that exists but belongs to another rabbi maps to the exact
  // same 404 as a lesson that does not exist at all: see the comment on
  // `LessonNotFoundError` for why this must not be a 403.
  if (error instanceof LessonNotFoundError) {
    return reply.status(404).send({ error: 'not_found', message: LESSON_NOT_FOUND_MESSAGE });
  }

  if (error instanceof UnknownCityError) {
    return reply.status(400).send({ error: 'unknown_city', message: `העיר שנבחרה אינה קיימת: '${error.cityCode}'` });
  }

  reply.request.log.error({ err: error }, `unhandled error in ${routeLabel}`);
  return reply.status(500).send({ error: 'internal_error', message: GENERIC_ERROR_MESSAGE });
};

export const registerRabbiLessonRoutes = async (app: FastifyInstance): Promise<void> => {
  app.get('/v1/rabbi/lessons', { preHandler: requireRabbiAuth }, async (request, reply) => {
    try {
      if (!request.rabbiUser) return reply;
      const query = rabbiLessonListQuerySchema.parse(request.query);
      const result = await rabbiLessonService.list(request.rabbiUser.rabbiId, query);
      return reply.send(toRabbiLessonListResponse(result));
    } catch (error) {
      return handleError(reply, error, 'GET /v1/rabbi/lessons');
    }
  });

  app.get('/v1/rabbi/occurrences', { preHandler: requireRabbiAuth }, async (request, reply) => {
    try {
      if (!request.rabbiUser) return reply;
      const items = await rabbiLessonService.listUpcomingOccurrences(request.rabbiUser.rabbiId, new Date());
      const response: RabbiOccurrenceListResponse = { items };
      return reply.send(response);
    } catch (error) {
      return handleError(reply, error, 'GET /v1/rabbi/occurrences');
    }
  });

  app.get('/v1/rabbi/lessons/:id', { preHandler: requireRabbiAuth }, async (request, reply) => {
    try {
      if (!request.rabbiUser) return reply;
      const { id } = lessonIdParamSchema.parse(request.params);
      const record = await rabbiLessonService.getOwnById(request.rabbiUser.rabbiId, id);
      return reply.send(toRabbiLessonResponse(record));
    } catch (error) {
      return handleError(reply, error, 'GET /v1/rabbi/lessons/:id');
    }
  });

  app.post('/v1/rabbi/lessons', { preHandler: requireRabbiAuth }, async (request, reply) => {
    try {
      if (!request.rabbiUser) return reply;
      const body = createRabbiLessonSchema.parse(request.body);
      const record = await rabbiLessonService.create(request.rabbiUser.rabbiId, body);
      return reply.status(201).send(toRabbiLessonResponse(record));
    } catch (error) {
      return handleError(reply, error, 'POST /v1/rabbi/lessons');
    }
  });

  app.patch('/v1/rabbi/lessons/:id', { preHandler: requireRabbiAuth }, async (request, reply) => {
    try {
      if (!request.rabbiUser) return reply;
      const { id } = lessonIdParamSchema.parse(request.params);
      const body = updateRabbiLessonSchema.parse(request.body);
      const record = await rabbiLessonService.update(request.rabbiUser.rabbiId, id, body);
      return reply.send(toRabbiLessonResponse(record));
    } catch (error) {
      return handleError(reply, error, 'PATCH /v1/rabbi/lessons/:id');
    }
  });

  app.delete('/v1/rabbi/lessons/:id', { preHandler: requireRabbiAuth }, async (request, reply) => {
    try {
      if (!request.rabbiUser) return reply;
      const { id } = lessonIdParamSchema.parse(request.params);
      await rabbiLessonService.remove(request.rabbiUser.rabbiId, id);
      return reply.status(204).send();
    } catch (error) {
      return handleError(reply, error, 'DELETE /v1/rabbi/lessons/:id');
    }
  });
};
