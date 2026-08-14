import type { FastifyInstance, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

import { toDeletePlacePreviewResponse, toPlaceListResponse, toPlaceResponse } from '../../../convertors/admin-place';
import { requireAdminAuth } from '../../../plugins/admin-guard';
import * as adminPlaceService from '../../../service/admin-place/admin-place';
import { PlaceDeleteConfirmationRequiredError, PlaceNotFoundError, UnknownCityError } from '../../../service/admin-place/errors';
import {
  createPlaceSchema,
  deletePlaceQuerySchema,
  placeIdParamSchema,
  placeListQuerySchema,
  updatePlaceSchema,
} from '../../../service/admin-place/models';

const GENERIC_ERROR_MESSAGE = 'אירעה שגיאה בשרת, נסו שוב מאוחר יותר';
const PLACE_NOT_FOUND_MESSAGE = 'המקום המבוקש לא נמצא';
const CONFIRM_REQUIRED_MESSAGE = 'מחיקת המקום תמחק גם את השיעורים והחריגים המשויכים אליו. יש לאשר את המחיקה';

const handleError = (reply: FastifyReply, error: unknown, routeLabel: string): FastifyReply => {
  if (error instanceof ZodError) {
    return reply.status(400).send({ error: 'invalid_request', message: 'הבקשה אינה תקינה', details: error.flatten() });
  }

  if (error instanceof PlaceNotFoundError) {
    return reply.status(404).send({ error: 'not_found', message: PLACE_NOT_FOUND_MESSAGE });
  }

  if (error instanceof UnknownCityError) {
    return reply.status(400).send({ error: 'unknown_city', message: `העיר שנבחרה אינה קיימת: '${error.cityId}'` });
  }

  if (error instanceof PlaceDeleteConfirmationRequiredError) {
    return reply.status(409).send({
      error: 'confirm_required',
      message: CONFIRM_REQUIRED_MESSAGE,
      lessonCount: error.lessonCount,
      exceptionCount: error.exceptionCount,
    });
  }

  reply.request.log.error({ err: error }, `unhandled error in ${routeLabel}`);
  return reply.status(500).send({ error: 'internal_error', message: GENERIC_ERROR_MESSAGE });
};

export const registerAdminPlaceRoutes = async (app: FastifyInstance): Promise<void> => {
  app.get('/v1/admin/places', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const query = placeListQuerySchema.parse(request.query);
      const result = await adminPlaceService.list(query);
      return reply.send(toPlaceListResponse(result));
    } catch (error) {
      return handleError(reply, error, 'GET /v1/admin/places');
    }
  });

  app.get('/v1/admin/places/:id', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const { id } = placeIdParamSchema.parse(request.params);
      const record = await adminPlaceService.getById(id);
      return reply.send(toPlaceResponse(record));
    } catch (error) {
      return handleError(reply, error, 'GET /v1/admin/places/:id');
    }
  });

  app.get('/v1/admin/places/:id/delete-preview', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const { id } = placeIdParamSchema.parse(request.params);
      const preview = await adminPlaceService.getDeletePreview(id);
      return reply.send(toDeletePlacePreviewResponse(preview));
    } catch (error) {
      return handleError(reply, error, 'GET /v1/admin/places/:id/delete-preview');
    }
  });

  app.post('/v1/admin/places', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const body = createPlaceSchema.parse(request.body);
      const record = await adminPlaceService.create(body);
      return reply.status(201).send(toPlaceResponse(record));
    } catch (error) {
      return handleError(reply, error, 'POST /v1/admin/places');
    }
  });

  app.patch('/v1/admin/places/:id', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const { id } = placeIdParamSchema.parse(request.params);
      const body = updatePlaceSchema.parse(request.body);
      const record = await adminPlaceService.update(id, body);
      return reply.send(toPlaceResponse(record));
    } catch (error) {
      return handleError(reply, error, 'PATCH /v1/admin/places/:id');
    }
  });

  app.delete('/v1/admin/places/:id', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const { id } = placeIdParamSchema.parse(request.params);
      const { confirm } = deletePlaceQuerySchema.parse(request.query);
      await adminPlaceService.remove(id, confirm);
      return reply.status(204).send();
    } catch (error) {
      return handleError(reply, error, 'DELETE /v1/admin/places/:id');
    }
  });
};
