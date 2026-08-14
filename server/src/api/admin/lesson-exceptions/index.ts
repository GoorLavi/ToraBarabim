import type { FastifyInstance, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

import { toLessonExceptionListResponse, toLessonExceptionResponse } from '../../../convertors/admin-lesson-exception';
import { requireAdminAuth } from '../../../plugins/admin-guard';
import * as adminLessonExceptionService from '../../../service/admin-lesson-exception/admin-lesson-exception';
import {
  DateNotInRecurrenceError,
  DuplicateExceptionError,
  ExceptionNotFoundError,
  LessonNotFoundError,
  ReferencedPlaceNotFoundError,
  ReferencedRabbiNotFoundError,
} from '../../../service/admin-lesson-exception/errors';
import { exceptionIdParamSchema, lessonExceptionSchema, lessonIdParamSchema } from '../../../service/admin-lesson-exception/models';

const GENERIC_ERROR_MESSAGE = 'אירעה שגיאה בשרת, נסו שוב מאוחר יותר';
const LESSON_NOT_FOUND_MESSAGE = 'השיעור המבוקש לא נמצא';
const EXCEPTION_NOT_FOUND_MESSAGE = 'החריג המבוקש לא נמצא';

const handleError = (reply: FastifyReply, error: unknown, routeLabel: string): FastifyReply => {
  if (error instanceof ZodError) {
    return reply.status(400).send({ error: 'invalid_request', message: 'הבקשה אינה תקינה', details: error.flatten() });
  }

  if (error instanceof LessonNotFoundError) {
    return reply.status(404).send({ error: 'not_found', message: LESSON_NOT_FOUND_MESSAGE });
  }

  if (error instanceof ExceptionNotFoundError) {
    return reply.status(404).send({ error: 'not_found', message: EXCEPTION_NOT_FOUND_MESSAGE });
  }

  if (error instanceof DuplicateExceptionError) {
    return reply.status(409).send({ error: 'duplicate_exception', message: 'כבר קיים חריג לשיעור זה בתאריך שנבחר' });
  }

  if (error instanceof DateNotInRecurrenceError) {
    return reply.status(400).send({ error: 'date_not_in_recurrence', message: 'התאריך שנבחר אינו מועד שבו השיעור מתקיים' });
  }

  if (error instanceof ReferencedRabbiNotFoundError) {
    return reply.status(400).send({ error: 'unknown_rabbi', message: `הרב הממלא מקום שנבחר אינו קיים: '${error.rabbiId}'` });
  }

  if (error instanceof ReferencedPlaceNotFoundError) {
    return reply.status(400).send({ error: 'unknown_place', message: `המקום שנבחר אינו קיים: '${error.placeId}'` });
  }

  reply.request.log.error({ err: error }, `unhandled error in ${routeLabel}`);
  return reply.status(500).send({ error: 'internal_error', message: GENERIC_ERROR_MESSAGE });
};

export const registerAdminLessonExceptionRoutes = async (app: FastifyInstance): Promise<void> => {
  app.get('/v1/admin/lessons/:lessonId/exceptions', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const { lessonId } = lessonIdParamSchema.parse(request.params);
      const records = await adminLessonExceptionService.listForLesson(lessonId);
      return reply.send(toLessonExceptionListResponse(records));
    } catch (error) {
      return handleError(reply, error, 'GET /v1/admin/lessons/:lessonId/exceptions');
    }
  });

  app.post('/v1/admin/lessons/:lessonId/exceptions', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const { lessonId } = lessonIdParamSchema.parse(request.params);
      const body = lessonExceptionSchema.parse(request.body);
      const record = await adminLessonExceptionService.create(lessonId, body);
      return reply.status(201).send(toLessonExceptionResponse(record));
    } catch (error) {
      return handleError(reply, error, 'POST /v1/admin/lessons/:lessonId/exceptions');
    }
  });

  app.patch('/v1/admin/lessons/:lessonId/exceptions/:exceptionId', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const { lessonId, exceptionId } = exceptionIdParamSchema.parse(request.params);
      const body = lessonExceptionSchema.parse(request.body);
      const record = await adminLessonExceptionService.update(lessonId, exceptionId, body);
      return reply.send(toLessonExceptionResponse(record));
    } catch (error) {
      return handleError(reply, error, 'PATCH /v1/admin/lessons/:lessonId/exceptions/:exceptionId');
    }
  });

  app.delete('/v1/admin/lessons/:lessonId/exceptions/:exceptionId', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const { lessonId, exceptionId } = exceptionIdParamSchema.parse(request.params);
      await adminLessonExceptionService.remove(lessonId, exceptionId);
      return reply.status(204).send();
    } catch (error) {
      return handleError(reply, error, 'DELETE /v1/admin/lessons/:lessonId/exceptions/:exceptionId');
    }
  });
};
