import type { FastifyInstance, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

import { toRabbiLessonExceptionListResponse, toRabbiLessonExceptionResponse } from '../../../convertors/rabbi-lesson-exception';
import { requireRabbiAuth } from '../../../plugins/rabbi-guard';
import {
  DateNotInRecurrenceError,
  DuplicateExceptionError,
  ExceptionNotFoundError,
  LessonNotFoundError,
  ReferencedRabbiNotFoundError,
  UnknownCityError,
} from '../../../service/rabbi-lesson-exception/errors';
import { exceptionIdParamSchema, lessonExceptionSchema, lessonIdParamSchema } from '../../../service/rabbi-lesson-exception/models';
import * as rabbiLessonExceptionService from '../../../service/rabbi-lesson-exception/rabbi-lesson-exception';

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

  if (error instanceof UnknownCityError) {
    return reply.status(400).send({ error: 'unknown_city', message: `העיר שנבחרה אינה קיימת: '${error.cityCode}'` });
  }

  reply.request.log.error({ err: error }, `unhandled error in ${routeLabel}`);
  return reply.status(500).send({ error: 'internal_error', message: GENERIC_ERROR_MESSAGE });
};

export const registerRabbiLessonExceptionRoutes = async (app: FastifyInstance): Promise<void> => {
  app.get('/v1/rabbi/lessons/:lessonId/exceptions', { preHandler: requireRabbiAuth }, async (request, reply) => {
    try {
      if (!request.rabbiUser) return reply;
      const { lessonId } = lessonIdParamSchema.parse(request.params);
      const records = await rabbiLessonExceptionService.listForOwnLesson(request.rabbiUser.rabbiId, lessonId);
      return reply.send(toRabbiLessonExceptionListResponse(records));
    } catch (error) {
      return handleError(reply, error, 'GET /v1/rabbi/lessons/:lessonId/exceptions');
    }
  });

  app.post('/v1/rabbi/lessons/:lessonId/exceptions', { preHandler: requireRabbiAuth }, async (request, reply) => {
    try {
      if (!request.rabbiUser) return reply;
      const { lessonId } = lessonIdParamSchema.parse(request.params);
      const body = lessonExceptionSchema.parse(request.body);
      const record = await rabbiLessonExceptionService.create(request.rabbiUser.rabbiId, lessonId, body);
      return reply.status(201).send(toRabbiLessonExceptionResponse(record));
    } catch (error) {
      return handleError(reply, error, 'POST /v1/rabbi/lessons/:lessonId/exceptions');
    }
  });

  app.patch('/v1/rabbi/lessons/:lessonId/exceptions/:exceptionId', { preHandler: requireRabbiAuth }, async (request, reply) => {
    try {
      if (!request.rabbiUser) return reply;
      const { lessonId, exceptionId } = exceptionIdParamSchema.parse(request.params);
      const body = lessonExceptionSchema.parse(request.body);
      const record = await rabbiLessonExceptionService.update(request.rabbiUser.rabbiId, lessonId, exceptionId, body);
      return reply.send(toRabbiLessonExceptionResponse(record));
    } catch (error) {
      return handleError(reply, error, 'PATCH /v1/rabbi/lessons/:lessonId/exceptions/:exceptionId');
    }
  });

  app.delete('/v1/rabbi/lessons/:lessonId/exceptions/:exceptionId', { preHandler: requireRabbiAuth }, async (request, reply) => {
    try {
      if (!request.rabbiUser) return reply;
      const { lessonId, exceptionId } = exceptionIdParamSchema.parse(request.params);
      await rabbiLessonExceptionService.remove(request.rabbiUser.rabbiId, lessonId, exceptionId);
      return reply.status(204).send();
    } catch (error) {
      return handleError(reply, error, 'DELETE /v1/rabbi/lessons/:lessonId/exceptions/:exceptionId');
    }
  });
};
