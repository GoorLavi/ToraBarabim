import type { FastifyInstance, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

import { loadConfig } from '../../../config';
import { toAdminPlaceListResponse, toAdminPlaceResponse } from '../../../convertors/admin-place';
import { requireAdminAuth } from '../../../plugins/admin-guard';
import * as adminPlaceService from '../../../service/admin-place/admin-place';
import { PlaceNotFoundError, UnknownCityError } from '../../../service/admin-place/errors';
import { createPlaceSchema, placeIdParamSchema, placeListQuerySchema, updatePlaceSchema } from '../../../service/admin-place/models';
import { INVALID_PHOTO_MESSAGE } from '../../../service/place/consts';
import {
  MalformedPlacePhotoHeaderError,
  PlacePhotoAspectRatioError,
  PlacePhotoTooLargeError,
  PlacePhotoTooSmallError,
  UnsupportedPlacePhotoTypeError,
} from '../../../service/place/errors';

const GENERIC_ERROR_MESSAGE = 'אירעה שגיאה בשרת, נסו שוב מאוחר יותר';
const PLACE_NOT_FOUND_MESSAGE = 'המקום המבוקש לא נמצא';
const NO_FILE_MESSAGE = 'לא צורף קובץ תמונה';

// @fastify/multipart's own size guard (`request.file({ limits: { fileSize } })`)
// throws this when the stream is read past the limit; it never reaches
// `PlacePhotoTooLargeError` below, which only guards a buffer already held.
const MULTIPART_FILE_TOO_LARGE_CODE = 'FST_REQ_FILE_TOO_LARGE';
const MULTIPART_INVALID_CONTENT_TYPE_CODE = 'FST_INVALID_MULTIPART_CONTENT_TYPE';

const hasCode = (error: unknown, code: string): boolean =>
  typeof error === 'object' && error !== null && 'code' in error && error.code === code;
const isMultipartFileTooLargeError = (error: unknown): boolean => hasCode(error, MULTIPART_FILE_TOO_LARGE_CODE);
const isInvalidMultipartContentTypeError = (error: unknown): boolean => hasCode(error, MULTIPART_INVALID_CONTENT_TYPE_CODE);

const fileTooLargeMessage = (maxBytes: number): string => {
  const megabytes = Math.max(1, Math.round(maxBytes / (1024 * 1024)));
  return `התמונה חורגת מהגודל המרבי המותר של ${megabytes} מגה-בייט`;
};

const handleError = (reply: FastifyReply, error: unknown, routeLabel: string): FastifyReply => {
  if (error instanceof ZodError) {
    return reply.status(400).send({ error: 'invalid_request', message: 'הבקשה אינה תקינה', details: error.flatten() });
  }

  if (error instanceof PlaceNotFoundError) {
    return reply.status(404).send({ error: 'not_found', message: PLACE_NOT_FOUND_MESSAGE });
  }

  if (error instanceof UnknownCityError) {
    return reply.status(400).send({ error: 'unknown_city', message: `העיר שנבחרה אינה קיימת: '${error.cityCode}'` });
  }

  if (error instanceof UnsupportedPlacePhotoTypeError) {
    return reply.status(400).send({ error: 'unsupported_file_type', message: 'ניתן להעלות תמונה מסוג jpg או png בלבד' });
  }

  if (error instanceof PlacePhotoTooLargeError) {
    return reply.status(413).send({ error: 'file_too_large', message: fileTooLargeMessage(error.maxBytes) });
  }

  if (error instanceof MalformedPlacePhotoHeaderError || error instanceof PlacePhotoTooSmallError || error instanceof PlacePhotoAspectRatioError) {
    return reply.status(400).send({ error: 'invalid_photo', message: INVALID_PHOTO_MESSAGE });
  }

  if (isMultipartFileTooLargeError(error)) {
    return reply.status(413).send({ error: 'file_too_large', message: fileTooLargeMessage(loadConfig(process.env).maxUploadBytes) });
  }

  if (isInvalidMultipartContentTypeError(error)) {
    return reply
      .status(415)
      .send({ error: 'invalid_content_type', message: 'יש לשלוח את קובץ התמונה כטופס מסוג multipart/form-data' });
  }

  reply.request.log.error({ err: error }, `unhandled error in ${routeLabel}`);
  return reply.status(500).send({ error: 'internal_error', message: GENERIC_ERROR_MESSAGE });
};

// No delete route: a place's whole removal mechanism is `isActive`,
// toggled through the regular update below (0004's place stays half void
// on purpose).
export const registerAdminPlaceRoutes = async (app: FastifyInstance): Promise<void> => {
  app.get('/v1/admin/places', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const query = placeListQuerySchema.parse(request.query);
      const result = await adminPlaceService.list(query);
      return reply.send(toAdminPlaceListResponse(result));
    } catch (error) {
      return handleError(reply, error, 'GET /v1/admin/places');
    }
  });

  app.get('/v1/admin/places/:id', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const { id } = placeIdParamSchema.parse(request.params);
      const record = await adminPlaceService.getById(id);
      return reply.send(toAdminPlaceResponse(record));
    } catch (error) {
      return handleError(reply, error, 'GET /v1/admin/places/:id');
    }
  });

  app.post('/v1/admin/places', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const body = createPlaceSchema.parse(request.body);
      const record = await adminPlaceService.create(body);
      return reply.status(201).send(toAdminPlaceResponse(record));
    } catch (error) {
      return handleError(reply, error, 'POST /v1/admin/places');
    }
  });

  app.patch('/v1/admin/places/:id', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const { id } = placeIdParamSchema.parse(request.params);
      const body = updatePlaceSchema.parse(request.body);
      const record = await adminPlaceService.update(id, body);
      return reply.send(toAdminPlaceResponse(record));
    } catch (error) {
      return handleError(reply, error, 'PATCH /v1/admin/places/:id');
    }
  });

  app.post('/v1/admin/places/:id/photo', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const { id } = placeIdParamSchema.parse(request.params);

      const config = loadConfig(process.env);
      const file = await request.file({ limits: { fileSize: config.maxUploadBytes } });
      if (!file) {
        return reply.status(400).send({ error: 'invalid_request', message: NO_FILE_MESSAGE });
      }

      const bytes = await file.toBuffer();
      const record = await adminPlaceService.replacePhoto(id, bytes, request.log);
      return reply.send(toAdminPlaceResponse(record));
    } catch (error) {
      return handleError(reply, error, 'POST /v1/admin/places/:id/photo');
    }
  });
};
