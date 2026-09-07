import type { FastifyInstance, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

import { loadConfig } from '../../../config';
import { toRabbiProfileResponse } from '../../../convertors/rabbi-profile';
import { requireRabbiAuth } from '../../../plugins/rabbi-guard';
import { PhotoTooLargeError, RabbiNotFoundError, UnsupportedPhotoTypeError } from '../../../service/rabbi-profile/errors';
import { updateRabbiProfileSchema } from '../../../service/rabbi-profile/models';
import * as rabbiProfileService from '../../../service/rabbi-profile/rabbi-profile';

const GENERIC_ERROR_MESSAGE = 'אירעה שגיאה בשרת, נסו שוב מאוחר יותר';
const RABBI_NOT_FOUND_MESSAGE = 'פרופיל הרב לא נמצא';
const NO_FILE_MESSAGE = 'לא צורף קובץ תמונה';

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

  if (error instanceof RabbiNotFoundError) {
    return reply.status(404).send({ error: 'not_found', message: RABBI_NOT_FOUND_MESSAGE });
  }

  if (error instanceof UnsupportedPhotoTypeError) {
    return reply.status(400).send({ error: 'unsupported_file_type', message: 'ניתן להעלות תמונה מסוג jpeg, png או webp בלבד' });
  }

  if (error instanceof PhotoTooLargeError) {
    return reply.status(413).send({ error: 'file_too_large', message: fileTooLargeMessage(error.maxBytes) });
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

export const registerRabbiProfileRoutes = async (app: FastifyInstance): Promise<void> => {
  app.get('/v1/rabbi/profile', { preHandler: requireRabbiAuth }, async (request, reply) => {
    try {
      if (!request.rabbiUser) return reply;
      const record = await rabbiProfileService.getOwn(request.rabbiUser.rabbiId);
      return reply.send(toRabbiProfileResponse(record));
    } catch (error) {
      return handleError(reply, error, 'GET /v1/rabbi/profile');
    }
  });

  app.patch('/v1/rabbi/profile', { preHandler: requireRabbiAuth }, async (request, reply) => {
    try {
      if (!request.rabbiUser) return reply;
      const body = updateRabbiProfileSchema.parse(request.body);
      const record = await rabbiProfileService.updateOwn(request.rabbiUser.rabbiId, body);
      return reply.send(toRabbiProfileResponse(record));
    } catch (error) {
      return handleError(reply, error, 'PATCH /v1/rabbi/profile');
    }
  });

  app.post('/v1/rabbi/profile/photo', { preHandler: requireRabbiAuth }, async (request, reply) => {
    try {
      if (!request.rabbiUser) return reply;

      const config = loadConfig(process.env);
      const file = await request.file({ limits: { fileSize: config.maxUploadBytes } });
      if (!file) {
        return reply.status(400).send({ error: 'invalid_request', message: NO_FILE_MESSAGE });
      }

      const bytes = await file.toBuffer();
      const record = await rabbiProfileService.replaceOwnPhoto(request.rabbiUser.rabbiId, bytes, request.log);
      return reply.send(toRabbiProfileResponse(record));
    } catch (error) {
      return handleError(reply, error, 'POST /v1/rabbi/profile/photo');
    }
  });
};
