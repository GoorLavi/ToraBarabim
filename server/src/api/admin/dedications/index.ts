import type { FastifyInstance, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

import { toAdminDedication, toDedicationListResponse } from '../../../convertors/admin-dedication';
import { requireAdminAuth } from '../../../plugins/admin-guard';
import * as adminDedicationService from '../../../service/admin-dedication/admin-dedication';
import { DedicationNotFoundError } from '../../../service/admin-dedication/errors';
import {
  createDedicationRequestSchema,
  dedicationIdParamSchema,
  dedicationListQuerySchema,
  previewDedicationSchema,
  takedownDedicationSchema,
  updateDedicationRequestSchema,
} from '../../../service/admin-dedication/models';

const GENERIC_ERROR_MESSAGE = 'אירעה שגיאה בשרת, נסו שוב מאוחר יותר';
const DEDICATION_NOT_FOUND_MESSAGE = 'ההקדשה המבוקשת לא נמצאה';

const handleError = (reply: FastifyReply, error: unknown, routeLabel: string): FastifyReply => {
  if (error instanceof ZodError) {
    return reply.status(400).send({ error: 'invalid_request', message: 'הבקשה אינה תקינה', details: error.flatten() });
  }

  if (error instanceof DedicationNotFoundError) {
    return reply.status(404).send({ error: 'not_found', message: DEDICATION_NOT_FOUND_MESSAGE });
  }

  reply.request.log.error({ err: error }, `unhandled error in ${routeLabel}`);
  return reply.status(500).send({ error: 'internal_error', message: GENERIC_ERROR_MESSAGE });
};

export const registerAdminDedicationRoutes = async (app: FastifyInstance): Promise<void> => {
  app.get('/v1/admin/dedications', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const query = dedicationListQuerySchema.parse(request.query);
      const result = await adminDedicationService.list(query);
      return reply.send(toDedicationListResponse(result, new Date()));
    } catch (error) {
      return handleError(reply, error, 'GET /v1/admin/dedications');
    }
  });

  app.post('/v1/admin/dedications', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const body = createDedicationRequestSchema.parse(request.body);
      const record = await adminDedicationService.create(body);
      return reply.status(201).send(toAdminDedication(record, new Date()));
    } catch (error) {
      return handleError(reply, error, 'POST /v1/admin/dedications');
    }
  });

  // A deceased person's name must never enter a URL or an access log, so
  // this is a POST, not a GET with query parameters, even though it never
  // writes anything. Shares this file's one `handleError`, and an
  // incomplete draft (only `type` required, see `previewDedicationSchema`)
  // is a normal 200, never a 404 and never a 500.
  app.post('/v1/admin/dedications/preview', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const body = previewDedicationSchema.parse(request.body);
      const text = adminDedicationService.previewText(body);
      return reply.send(text);
    } catch (error) {
      return handleError(reply, error, 'POST /v1/admin/dedications/preview');
    }
  });

  app.patch('/v1/admin/dedications/:id', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const { id } = dedicationIdParamSchema.parse(request.params);
      const body = updateDedicationRequestSchema.parse(request.body);
      const record = await adminDedicationService.update(id, body);
      return reply.send(toAdminDedication(record, new Date()));
    } catch (error) {
      return handleError(reply, error, 'PATCH /v1/admin/dedications/:id');
    }
  });

  app.post('/v1/admin/dedications/:id/takedown', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const { id } = dedicationIdParamSchema.parse(request.params);
      const body = takedownDedicationSchema.parse(request.body);
      const record = await adminDedicationService.takedown(id, body);
      return reply.send(toAdminDedication(record, new Date()));
    } catch (error) {
      return handleError(reply, error, 'POST /v1/admin/dedications/:id/takedown');
    }
  });
};
