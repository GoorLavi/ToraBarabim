import type { FastifyInstance, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

import type { CourseErrorBody } from '@torabarabim/common';

import { loadConfig } from '../../../config';
import { toCourseListResponse, toCourseResponse } from '../../../convertors/panel-course';
import { requireRabbiAuth } from '../../../plugins/rabbi-guard';
import { COURSE_ERROR_STATUS, toCourseErrorBody } from '../../course-error-reply';
import { CourseNotFoundError, CoursePhotoNotFoundError, CoursePhotoTooLargeError, CoverRequiredError, MalformedCourseFieldsError, ReferencedPlaceNotFoundError, UnknownCityError } from '../../../service/course/errors';
import { createRabbiCourseSchema, rabbiCourseListQuerySchema, updateRabbiCourseSchema } from '../../../service/rabbi-course/models';
import * as rabbiCourseService from '../../../service/rabbi-course/rabbi-course';
import { photoTooLargeMessage } from '../../../service/shared/consts';
import { duplicateCourseSchema, panelCourseIdParamSchema, panelCourseIdWithPhotoIdParamSchema } from '../../../service/shared/models';
import { multipartPluginErrorReply, readCourseMultipartCreate } from '../../course-multipart';

const GENERIC_ERROR_MESSAGE = 'אירעה שגיאה בשרת, נסו שוב מאוחר יותר';
const COURSE_NOT_FOUND_MESSAGE = 'הקורס המבוקש לא נמצא';
const MALFORMED_COURSE_JSON_MESSAGE = 'חלק ה-JSON של הקורס אינו תקין או חסר';

const MULTIPART_FILE_TOO_LARGE_CODE = 'FST_REQ_FILE_TOO_LARGE';
const MULTIPART_INVALID_CONTENT_TYPE_CODE = 'FST_INVALID_MULTIPART_CONTENT_TYPE';
const hasCode = (error: unknown, code: string): boolean => typeof error === 'object' && error !== null && 'code' in error && error.code === code;
const isMultipartFileTooLargeError = (error: unknown): boolean => hasCode(error, MULTIPART_FILE_TOO_LARGE_CODE);
const isInvalidMultipartContentTypeError = (error: unknown): boolean => hasCode(error, MULTIPART_INVALID_CONTENT_TYPE_CODE);

// The nine course-specific codes are handled through `toCourseErrorBody`,
// shared with the admin router so the two never build the same shape twice;
// `message` on each is the developer-facing English line off the error
// itself, never shown to a user (the client builds its own Hebrew from
// `error` and `details`, per the house rule that the client never renders a
// server message). Every other error here (unknown city, unknown place, not
// found, malformed request) is the shared, cross-domain shape every route in
// this codebase already uses, Hebrew message included.
const handleError = (reply: FastifyReply, error: unknown, routeLabel: string): FastifyReply => {
  const courseError = toCourseErrorBody(error);
  if (courseError) return reply.status(COURSE_ERROR_STATUS[courseError.error]).send(courseError satisfies CourseErrorBody);

  if (error instanceof ZodError) {
    return reply.status(400).send({ error: 'invalid_request', message: 'הבקשה אינה תקינה', details: error.flatten() });
  }

  if (error instanceof MalformedCourseFieldsError) {
    return reply.status(400).send({ error: 'invalid_request', message: MALFORMED_COURSE_JSON_MESSAGE });
  }

  if (error instanceof CourseNotFoundError || error instanceof CoursePhotoNotFoundError) {
    return reply.status(404).send({ error: 'not_found', message: COURSE_NOT_FOUND_MESSAGE });
  }

  if (error instanceof UnknownCityError) {
    return reply.status(400).send({ error: 'unknown_city', message: `העיר שנבחרה אינה קיימת: '${error.cityCode}'` });
  }

  if (error instanceof ReferencedPlaceNotFoundError) {
    return reply.status(400).send({ error: 'unknown_place', message: `המקום שנבחר אינו קיים או אינו פעיל: '${error.placeId}'` });
  }

  if (error instanceof CoursePhotoTooLargeError) {
    return reply.status(413).send({ error: 'file_too_large', message: photoTooLargeMessage(error.maxBytes) });
  }

  if (isMultipartFileTooLargeError(error)) {
    return reply.status(413).send({ error: 'file_too_large', message: photoTooLargeMessage(loadConfig(process.env).maxUploadBytes) });
  }

  if (isInvalidMultipartContentTypeError(error)) {
    return reply.status(415).send({ error: 'invalid_content_type', message: 'יש לשלוח את הבקשה כטופס מסוג multipart/form-data' });
  }

  const multipartError = multipartPluginErrorReply(error);
  if (multipartError) return reply.status(multipartError.status).send(multipartError.body);

  reply.request.log.error({ err: error }, `unhandled error in ${routeLabel}`);
  return reply.status(500).send({ error: 'internal_error', message: GENERIC_ERROR_MESSAGE });
};

export const registerRabbiCourseRoutes = async (app: FastifyInstance): Promise<void> => {
  app.get('/v1/rabbi/courses', { preHandler: requireRabbiAuth }, async (request, reply) => {
    try {
      if (!request.rabbiUser) return reply;
      const query = rabbiCourseListQuerySchema.parse(request.query);
      const result = await rabbiCourseService.list(request.rabbiUser.rabbiId, query);
      return reply.send(toCourseListResponse(result));
    } catch (error) {
      return handleError(reply, error, 'GET /v1/rabbi/courses');
    }
  });

  app.get('/v1/rabbi/courses/:id', { preHandler: requireRabbiAuth }, async (request, reply) => {
    try {
      if (!request.rabbiUser) return reply;
      const { id } = panelCourseIdParamSchema.parse(request.params);
      const record = await rabbiCourseService.getOwnById(request.rabbiUser.rabbiId, id);
      return reply.send(toCourseResponse(record));
    } catch (error) {
      return handleError(reply, error, 'GET /v1/rabbi/courses/:id');
    }
  });

  app.post('/v1/rabbi/courses', { preHandler: requireRabbiAuth }, async (request, reply) => {
    try {
      if (!request.rabbiUser) return reply;

      const { maxUploadBytes } = loadConfig(process.env);
      const { fields, cover } = await readCourseMultipartCreate(request, maxUploadBytes, createRabbiCourseSchema);

      const record = await rabbiCourseService.create(request.rabbiUser.rabbiId, fields, cover, request.log);
      return reply.status(201).send(toCourseResponse(record));
    } catch (error) {
      return handleError(reply, error, 'POST /v1/rabbi/courses');
    }
  });

  app.patch('/v1/rabbi/courses/:id', { preHandler: requireRabbiAuth }, async (request, reply) => {
    try {
      if (!request.rabbiUser) return reply;
      const { id } = panelCourseIdParamSchema.parse(request.params);
      const body = updateRabbiCourseSchema.parse(request.body);
      const record = await rabbiCourseService.update(request.rabbiUser.rabbiId, id, body);
      return reply.send(toCourseResponse(record));
    } catch (error) {
      return handleError(reply, error, 'PATCH /v1/rabbi/courses/:id');
    }
  });

  app.post('/v1/rabbi/courses/:id/cover', { preHandler: requireRabbiAuth }, async (request, reply) => {
    try {
      if (!request.rabbiUser) return reply;
      const { id } = panelCourseIdParamSchema.parse(request.params);

      const config = loadConfig(process.env);
      const file = await request.file({ limits: { fileSize: config.maxUploadBytes } });
      if (!file) throw new CoverRequiredError();
      const bytes = await file.toBuffer();

      const record = await rabbiCourseService.replaceCover(request.rabbiUser.rabbiId, id, bytes, request.log);
      return reply.send(toCourseResponse(record));
    } catch (error) {
      return handleError(reply, error, 'POST /v1/rabbi/courses/:id/cover');
    }
  });

  app.post('/v1/rabbi/courses/:id/photos', { preHandler: requireRabbiAuth }, async (request, reply) => {
    try {
      if (!request.rabbiUser) return reply;
      const { id } = panelCourseIdParamSchema.parse(request.params);

      const config = loadConfig(process.env);
      const file = await request.file({ limits: { fileSize: config.maxUploadBytes } });
      if (!file) return reply.status(400).send({ error: 'invalid_request', message: 'לא צורף קובץ תמונה' });
      const bytes = await file.toBuffer();

      const record = await rabbiCourseService.addPhoto(request.rabbiUser.rabbiId, id, bytes, request.log);
      return reply.status(201).send(toCourseResponse(record));
    } catch (error) {
      return handleError(reply, error, 'POST /v1/rabbi/courses/:id/photos');
    }
  });

  app.delete('/v1/rabbi/courses/:id/photos/:photoId', { preHandler: requireRabbiAuth }, async (request, reply) => {
    try {
      if (!request.rabbiUser) return reply;
      const { id, photoId } = panelCourseIdWithPhotoIdParamSchema.parse(request.params);
      await rabbiCourseService.removePhoto(request.rabbiUser.rabbiId, id, photoId, request.log);
      return reply.status(204).send();
    } catch (error) {
      return handleError(reply, error, 'DELETE /v1/rabbi/courses/:id/photos/:photoId');
    }
  });

  app.post('/v1/rabbi/courses/:id/close', { preHandler: requireRabbiAuth }, async (request, reply) => {
    try {
      if (!request.rabbiUser) return reply;
      const { id } = panelCourseIdParamSchema.parse(request.params);
      const record = await rabbiCourseService.close(request.rabbiUser.rabbiId, id);
      return reply.send(toCourseResponse(record));
    } catch (error) {
      return handleError(reply, error, 'POST /v1/rabbi/courses/:id/close');
    }
  });

  app.post('/v1/rabbi/courses/:id/full', { preHandler: requireRabbiAuth }, async (request, reply) => {
    try {
      if (!request.rabbiUser) return reply;
      const { id } = panelCourseIdParamSchema.parse(request.params);
      const record = await rabbiCourseService.markFull(request.rabbiUser.rabbiId, id);
      return reply.send(toCourseResponse(record));
    } catch (error) {
      return handleError(reply, error, 'POST /v1/rabbi/courses/:id/full');
    }
  });

  app.post('/v1/rabbi/courses/:id/duplicate', { preHandler: requireRabbiAuth }, async (request, reply) => {
    try {
      if (!request.rabbiUser) return reply;
      const { id } = panelCourseIdParamSchema.parse(request.params);
      const body = duplicateCourseSchema.parse(request.body);
      const record = await rabbiCourseService.duplicate(request.rabbiUser.rabbiId, id, body, request.log);
      return reply.status(201).send(toCourseResponse(record));
    } catch (error) {
      return handleError(reply, error, 'POST /v1/rabbi/courses/:id/duplicate');
    }
  });

  app.delete('/v1/rabbi/courses/:id', { preHandler: requireRabbiAuth }, async (request, reply) => {
    try {
      if (!request.rabbiUser) return reply;
      const { id } = panelCourseIdParamSchema.parse(request.params);
      await rabbiCourseService.remove(request.rabbiUser.rabbiId, id, request.log);
      return reply.status(204).send();
    } catch (error) {
      return handleError(reply, error, 'DELETE /v1/rabbi/courses/:id');
    }
  });
};
