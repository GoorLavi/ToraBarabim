import type { FastifyInstance, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

import { loadConfig } from '../../../config';
import { toCourseListResponse, toCourseResponse } from '../../../convertors/panel-course';
import { requireAdminAuth } from '../../../plugins/admin-guard';
import { adminCourseListQuerySchema, courseIdParamSchema, createCourseSchema, updateCourseSchema } from '../../../service/admin-course/models';
import * as adminCourseService from '../../../service/admin-course/admin-course';
import {
  courseClosedMessage,
  courseNotClosedMessage,
  coursePhotoTooSmallMessage,
  courseRabbanitAudienceMessage,
  courseWouldBeClosedMessage,
  openingDateNotFutureMessage,
} from '../../../service/course/consts';
import {
  CourseClosedError,
  CourseGalleryFullError,
  CourseNotClosedError,
  CourseNotFoundError,
  CoursePhotoNotFoundError,
  CoursePhotoTooLargeError,
  CoursePhotoTooSmallError,
  CourseWouldBeClosedError,
  MalformedCoursePhotoHeaderError,
  OpeningDateNotFutureError,
  ReferencedPlaceNotFoundError,
  ReferencedRabbiNotFoundError,
  UnknownCityError,
  UnsupportedCoursePhotoTypeError,
} from '../../../service/course/errors';
import { photoTooLargeMessage } from '../../../service/shared/consts';
import { RabbanitAudienceMustBeWomenError } from '../../../service/shared/errors';
import { duplicateCourseSchema } from '../../../service/shared/models';
import { readCourseMultipartCreate } from '../../course-multipart';

const GENERIC_ERROR_MESSAGE = 'אירעה שגיאה בשרת, נסו שוב מאוחר יותר';
const COURSE_NOT_FOUND_MESSAGE = 'הקורס המבוקש לא נמצא';
const COVER_REQUIRED_MESSAGE = 'לא צורף קובץ תמונה ראשית';
const MALFORMED_COURSE_JSON_MESSAGE = 'חלק ה-JSON של הקורס אינו תקין';

const MULTIPART_FILE_TOO_LARGE_CODE = 'FST_REQ_FILE_TOO_LARGE';
const MULTIPART_INVALID_CONTENT_TYPE_CODE = 'FST_INVALID_MULTIPART_CONTENT_TYPE';
const hasCode = (error: unknown, code: string): boolean => typeof error === 'object' && error !== null && 'code' in error && error.code === code;
const isMultipartFileTooLargeError = (error: unknown): boolean => hasCode(error, MULTIPART_FILE_TOO_LARGE_CODE);
const isInvalidMultipartContentTypeError = (error: unknown): boolean => hasCode(error, MULTIPART_INVALID_CONTENT_TYPE_CODE);

const handleError = (reply: FastifyReply, error: unknown, routeLabel: string): FastifyReply => {
  if (error instanceof ZodError) {
    return reply.status(400).send({ error: 'invalid_request', message: 'הבקשה אינה תקינה', details: error.flatten() });
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

  if (error instanceof ReferencedRabbiNotFoundError) {
    return reply.status(400).send({ error: 'unknown_rabbi', message: `הרב שנבחר אינו קיים: '${error.rabbiId}'` });
  }

  if (error instanceof RabbanitAudienceMustBeWomenError) {
    return reply.status(400).send({ error: 'rabbanit_audience_must_be_women', message: courseRabbanitAudienceMessage(error.audience) });
  }

  if (error instanceof CourseWouldBeClosedError) {
    return reply.status(400).send({ error: 'course_would_be_closed', message: courseWouldBeClosedMessage(error.openingDate) });
  }

  if (error instanceof OpeningDateNotFutureError) {
    return reply.status(400).send({ error: 'opening_date_not_future', message: openingDateNotFutureMessage(error.openingDate) });
  }

  if (error instanceof CoursePhotoTooSmallError) {
    return reply.status(400).send({ error: 'photo_too_small', message: coursePhotoTooSmallMessage(error.shortestSide) });
  }

  if (error instanceof UnsupportedCoursePhotoTypeError || error instanceof MalformedCoursePhotoHeaderError) {
    return reply.status(400).send({ error: 'unsupported_file_type', message: 'אפשר להעלות קובץ JPG או PNG בלבד' });
  }

  if (error instanceof CourseClosedError) {
    return reply.status(409).send({ error: 'course_closed', message: courseClosedMessage(error.courseName, error.reason) });
  }

  if (error instanceof CourseNotClosedError) {
    return reply.status(409).send({ error: 'course_not_closed', message: courseNotClosedMessage(error.courseName) });
  }

  if (error instanceof CourseGalleryFullError) {
    return reply.status(409).send({ error: 'course_photo_limit', message: `אפשר להעלות עד ${error.max} תמונות לגלריה` });
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

  reply.request.log.error({ err: error }, `unhandled error in ${routeLabel}`);
  return reply.status(500).send({ error: 'internal_error', message: GENERIC_ERROR_MESSAGE });
};

export const registerAdminCourseRoutes = async (app: FastifyInstance): Promise<void> => {
  app.get('/v1/admin/courses', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const query = adminCourseListQuerySchema.parse(request.query);
      const result = await adminCourseService.list(query);
      return reply.send(toCourseListResponse(result));
    } catch (error) {
      return handleError(reply, error, 'GET /v1/admin/courses');
    }
  });

  app.get('/v1/admin/courses/:id', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const { id } = courseIdParamSchema.parse(request.params);
      const record = await adminCourseService.getById(id);
      return reply.send(toCourseResponse(record));
    } catch (error) {
      return handleError(reply, error, 'GET /v1/admin/courses/:id');
    }
  });

  app.post('/v1/admin/courses', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const { maxUploadBytes } = loadConfig(process.env);
      const { fieldsJson, cover } = await readCourseMultipartCreate(request, maxUploadBytes);

      if (fieldsJson === undefined) {
        return reply.status(400).send({ error: 'invalid_request', message: MALFORMED_COURSE_JSON_MESSAGE });
      }
      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(fieldsJson);
      } catch {
        return reply.status(400).send({ error: 'invalid_request', message: MALFORMED_COURSE_JSON_MESSAGE });
      }
      const body = createCourseSchema.parse(parsedJson);

      if (!cover) {
        return reply.status(400).send({ error: 'cover_required', message: COVER_REQUIRED_MESSAGE });
      }

      const record = await adminCourseService.create(body, cover, request.log);
      return reply.status(201).send(toCourseResponse(record));
    } catch (error) {
      return handleError(reply, error, 'POST /v1/admin/courses');
    }
  });

  app.patch('/v1/admin/courses/:id', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const { id } = courseIdParamSchema.parse(request.params);
      const body = updateCourseSchema.parse(request.body);
      const record = await adminCourseService.update(id, body);
      return reply.send(toCourseResponse(record));
    } catch (error) {
      return handleError(reply, error, 'PATCH /v1/admin/courses/:id');
    }
  });

  app.post('/v1/admin/courses/:id/cover', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const { id } = courseIdParamSchema.parse(request.params);

      const config = loadConfig(process.env);
      const file = await request.file({ limits: { fileSize: config.maxUploadBytes } });
      if (!file) return reply.status(400).send({ error: 'invalid_request', message: COVER_REQUIRED_MESSAGE });
      const bytes = await file.toBuffer();

      const record = await adminCourseService.replaceCover(id, bytes, request.log);
      return reply.send(toCourseResponse(record));
    } catch (error) {
      return handleError(reply, error, 'POST /v1/admin/courses/:id/cover');
    }
  });

  app.post('/v1/admin/courses/:id/photos', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const { id } = courseIdParamSchema.parse(request.params);

      const config = loadConfig(process.env);
      const file = await request.file({ limits: { fileSize: config.maxUploadBytes } });
      if (!file) return reply.status(400).send({ error: 'invalid_request', message: 'לא צורף קובץ תמונה' });
      const bytes = await file.toBuffer();

      const record = await adminCourseService.addPhoto(id, bytes, request.log);
      return reply.status(201).send(toCourseResponse(record));
    } catch (error) {
      return handleError(reply, error, 'POST /v1/admin/courses/:id/photos');
    }
  });

  app.delete('/v1/admin/courses/:id/photos/:photoId', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const { id, photoId } = courseIdParamSchema.extend({ photoId: courseIdParamSchema.shape.id }).parse(request.params);
      await adminCourseService.removePhoto(id, photoId, request.log);
      return reply.status(204).send();
    } catch (error) {
      return handleError(reply, error, 'DELETE /v1/admin/courses/:id/photos/:photoId');
    }
  });

  app.post('/v1/admin/courses/:id/close', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const { id } = courseIdParamSchema.parse(request.params);
      const record = await adminCourseService.close(id);
      return reply.send(toCourseResponse(record));
    } catch (error) {
      return handleError(reply, error, 'POST /v1/admin/courses/:id/close');
    }
  });

  app.post('/v1/admin/courses/:id/full', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const { id } = courseIdParamSchema.parse(request.params);
      const record = await adminCourseService.markFull(id);
      return reply.send(toCourseResponse(record));
    } catch (error) {
      return handleError(reply, error, 'POST /v1/admin/courses/:id/full');
    }
  });

  app.post('/v1/admin/courses/:id/duplicate', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const { id } = courseIdParamSchema.parse(request.params);
      const body = duplicateCourseSchema.parse(request.body);
      const record = await adminCourseService.duplicate(id, body, request.log);
      return reply.status(201).send(toCourseResponse(record));
    } catch (error) {
      return handleError(reply, error, 'POST /v1/admin/courses/:id/duplicate');
    }
  });

  app.delete('/v1/admin/courses/:id', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const { id } = courseIdParamSchema.parse(request.params);
      await adminCourseService.remove(id, request.log);
      return reply.status(204).send();
    } catch (error) {
      return handleError(reply, error, 'DELETE /v1/admin/courses/:id');
    }
  });
};
