import type { FastifyInstance, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

import { loadConfig } from '../../../config';
import { toDeleteRabbiPreviewResponse, toRabbiListResponse, toRabbiResponse } from '../../../convertors/admin-rabbi';
import { requireAdminAuth } from '../../../plugins/admin-guard';
import * as adminRabbiService from '../../../service/admin-rabbi/admin-rabbi';
import {
  PhotoTooLargeError,
  RabbiDeleteConfirmationRequiredError,
  RabbiNotFoundError,
  UnsupportedPhotoTypeError,
} from '../../../service/admin-rabbi/errors';
import {
  createRabbiSchema,
  deleteRabbiQuerySchema,
  rabbiIdParamSchema,
  rabbiListQuerySchema,
  updateRabbiSchema,
} from '../../../service/admin-rabbi/models';

const GENERIC_ERROR_MESSAGE = 'אירעה שגיאה בשרת, נסו שוב מאוחר יותר';
const RABBI_NOT_FOUND_MESSAGE = 'הרב המבוקש לא נמצא';
const CONFIRM_REQUIRED_MESSAGE = 'מחיקת הרב תמחק גם את השיעורים והחריגים המשויכים אליו. יש לאשר את המחיקה';
const NO_FILE_MESSAGE = 'לא צורף קובץ תמונה';

// @fastify/multipart's own size guard (`request.file({ limits: { fileSize } })`)
// throws this when the stream is read past the limit; it never reaches
// `PhotoTooLargeError` below, which only guards a buffer we already hold.
const MULTIPART_FILE_TOO_LARGE_CODE = 'FST_REQ_FILE_TOO_LARGE';
// Thrown by `request.file()` itself when the request's Content-Type isn't
// multipart at all, e.g. a client that sent JSON to this endpoint by mistake.
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

  if (error instanceof RabbiDeleteConfirmationRequiredError) {
    return reply.status(409).send({
      error: 'confirm_required',
      message: CONFIRM_REQUIRED_MESSAGE,
      lessonCount: error.lessonCount,
      exceptionCount: error.exceptionCount,
    });
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

export const registerAdminRabbiRoutes = async (app: FastifyInstance): Promise<void> => {
  app.get('/v1/admin/rabbis', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const query = rabbiListQuerySchema.parse(request.query);
      const result = await adminRabbiService.list(query);
      return reply.send(toRabbiListResponse(result));
    } catch (error) {
      return handleError(reply, error, 'GET /v1/admin/rabbis');
    }
  });

  app.get('/v1/admin/rabbis/:id', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const { id } = rabbiIdParamSchema.parse(request.params);
      const record = await adminRabbiService.getById(id);
      return reply.send(toRabbiResponse(record));
    } catch (error) {
      return handleError(reply, error, 'GET /v1/admin/rabbis/:id');
    }
  });

  app.get('/v1/admin/rabbis/:id/delete-preview', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const { id } = rabbiIdParamSchema.parse(request.params);
      const preview = await adminRabbiService.getDeletePreview(id);
      return reply.send(toDeleteRabbiPreviewResponse(preview));
    } catch (error) {
      return handleError(reply, error, 'GET /v1/admin/rabbis/:id/delete-preview');
    }
  });

  app.post('/v1/admin/rabbis', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const body = createRabbiSchema.parse(request.body);
      const record = await adminRabbiService.create(body);
      return reply.status(201).send(toRabbiResponse(record));
    } catch (error) {
      return handleError(reply, error, 'POST /v1/admin/rabbis');
    }
  });

  app.patch('/v1/admin/rabbis/:id', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const { id } = rabbiIdParamSchema.parse(request.params);
      const body = updateRabbiSchema.parse(request.body);
      const record = await adminRabbiService.update(id, body);
      return reply.send(toRabbiResponse(record));
    } catch (error) {
      return handleError(reply, error, 'PATCH /v1/admin/rabbis/:id');
    }
  });

  app.delete('/v1/admin/rabbis/:id', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const { id } = rabbiIdParamSchema.parse(request.params);
      const { confirm } = deleteRabbiQuerySchema.parse(request.query);
      await adminRabbiService.remove(id, confirm, request.log);
      return reply.status(204).send();
    } catch (error) {
      return handleError(reply, error, 'DELETE /v1/admin/rabbis/:id');
    }
  });

  app.post('/v1/admin/rabbis/:id/photo', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const { id } = rabbiIdParamSchema.parse(request.params);

      const config = loadConfig(process.env);
      const file = await request.file({ limits: { fileSize: config.maxUploadBytes } });
      if (!file) {
        return reply.status(400).send({ error: 'invalid_request', message: NO_FILE_MESSAGE });
      }

      // @fastify/multipart throws FST_REQ_FILE_TOO_LARGE from `toBuffer()`
      // itself once the stream passes the `limits.fileSize` above; the
      // `truncated` flag is only ever set alongside that thrown error, so
      // checking it here would be dead code, not a second real guard.
      const bytes = await file.toBuffer();

      const record = await adminRabbiService.replacePhoto(id, bytes, request.log);
      return reply.send(toRabbiResponse(record));
    } catch (error) {
      return handleError(reply, error, 'POST /v1/admin/rabbis/:id/photo');
    }
  });
};
