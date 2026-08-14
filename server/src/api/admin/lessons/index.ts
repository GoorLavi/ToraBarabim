import type { FastifyInstance, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

import { toLessonListResponse, toLessonResponse } from '../../../convertors/admin-lesson';
import { requireAdminAuth } from '../../../plugins/admin-guard';
import * as adminLessonService from '../../../service/admin-lesson/admin-lesson';
import { LessonNotFoundError, ReferencedPlaceNotFoundError, ReferencedRabbiNotFoundError } from '../../../service/admin-lesson/errors';
import { createLessonSchema, lessonIdParamSchema, lessonListQuerySchema, updateLessonSchema } from '../../../service/admin-lesson/models';

const GENERIC_ERROR_MESSAGE = 'אירעה שגיאה בשרת, נסו שוב מאוחר יותר';
const LESSON_NOT_FOUND_MESSAGE = 'השיעור המבוקש לא נמצא';

const handleError = (reply: FastifyReply, error: unknown, routeLabel: string): FastifyReply => {
  if (error instanceof ZodError) {
    return reply.status(400).send({ error: 'invalid_request', message: 'הבקשה אינה תקינה', details: error.flatten() });
  }

  if (error instanceof LessonNotFoundError) {
    return reply.status(404).send({ error: 'not_found', message: LESSON_NOT_FOUND_MESSAGE });
  }

  if (error instanceof ReferencedRabbiNotFoundError) {
    return reply.status(400).send({ error: 'unknown_rabbi', message: `הרב שנבחר אינו קיים: '${error.rabbiId}'` });
  }

  if (error instanceof ReferencedPlaceNotFoundError) {
    return reply.status(400).send({ error: 'unknown_place', message: `המקום שנבחר אינו קיים: '${error.placeId}'` });
  }

  reply.request.log.error({ err: error }, `unhandled error in ${routeLabel}`);
  return reply.status(500).send({ error: 'internal_error', message: GENERIC_ERROR_MESSAGE });
};

export const registerAdminLessonRoutes = async (app: FastifyInstance): Promise<void> => {
  app.get('/v1/admin/lessons', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const query = lessonListQuerySchema.parse(request.query);
      const result = await adminLessonService.list(query);
      return reply.send(toLessonListResponse(result));
    } catch (error) {
      return handleError(reply, error, 'GET /v1/admin/lessons');
    }
  });

  app.get('/v1/admin/lessons/:id', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const { id } = lessonIdParamSchema.parse(request.params);
      const record = await adminLessonService.getById(id);
      return reply.send(toLessonResponse(record));
    } catch (error) {
      return handleError(reply, error, 'GET /v1/admin/lessons/:id');
    }
  });

  app.post('/v1/admin/lessons', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const body = createLessonSchema.parse(request.body);
      const record = await adminLessonService.create(body);
      return reply.status(201).send(toLessonResponse(record));
    } catch (error) {
      return handleError(reply, error, 'POST /v1/admin/lessons');
    }
  });

  app.patch('/v1/admin/lessons/:id', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const { id } = lessonIdParamSchema.parse(request.params);
      const body = updateLessonSchema.parse(request.body);
      const record = await adminLessonService.update(id, body);
      return reply.send(toLessonResponse(record));
    } catch (error) {
      return handleError(reply, error, 'PATCH /v1/admin/lessons/:id');
    }
  });

  app.delete('/v1/admin/lessons/:id', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const { id } = lessonIdParamSchema.parse(request.params);
      await adminLessonService.remove(id);
      return reply.status(204).send();
    } catch (error) {
      return handleError(reply, error, 'DELETE /v1/admin/lessons/:id');
    }
  });
};
