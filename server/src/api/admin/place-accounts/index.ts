import type { FastifyInstance, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

import { toPlaceAccountCreatedResponse, toPlaceAccountResponse, toResetPlacePasswordResponse } from '../../../convertors/admin-place-account';
import { requireAdminAuth } from '../../../plugins/admin-guard';
import * as adminPlaceAccountService from '../../../service/admin-place/account';
import {
  DuplicateEmailError,
  DuplicateUsernameError,
  PlaceAccountAlreadyExistsError,
  PlaceAccountNotFoundError,
  PlaceNotFoundError,
} from '../../../service/admin-place/errors';
import { createPlaceAccountSchema, placeIdParamSchema, updatePlaceAccountSchema } from '../../../service/admin-place/models';

const GENERIC_ERROR_MESSAGE = 'אירעה שגיאה בשרת, נסו שוב מאוחר יותר';
const PLACE_NOT_FOUND_MESSAGE = 'המקום המבוקש לא נמצא';
const ACCOUNT_NOT_FOUND_MESSAGE = 'למקום זה אין עדיין חשבון התחברות';
const ACCOUNT_ALREADY_EXISTS_MESSAGE = 'למקום זה כבר יש חשבון התחברות';

const handleError = (reply: FastifyReply, error: unknown, routeLabel: string): FastifyReply => {
  if (error instanceof ZodError) {
    return reply.status(400).send({ error: 'invalid_request', message: 'הבקשה אינה תקינה', details: error.flatten() });
  }

  if (error instanceof PlaceNotFoundError) {
    return reply.status(404).send({ error: 'not_found', message: PLACE_NOT_FOUND_MESSAGE });
  }

  if (error instanceof PlaceAccountNotFoundError) {
    return reply.status(404).send({ error: 'account_not_found', message: ACCOUNT_NOT_FOUND_MESSAGE });
  }

  if (error instanceof PlaceAccountAlreadyExistsError) {
    return reply.status(409).send({ error: 'account_already_exists', message: ACCOUNT_ALREADY_EXISTS_MESSAGE });
  }

  if (error instanceof DuplicateEmailError) {
    return reply.status(409).send({ error: 'duplicate_email', message: `כתובת האימייל '${error.email}' כבר בשימוש` });
  }

  if (error instanceof DuplicateUsernameError) {
    return reply.status(409).send({ error: 'duplicate_username', message: `שם המשתמש '${error.username}' כבר בשימוש` });
  }

  reply.request.log.error({ err: error }, `unhandled error in ${routeLabel}`);
  return reply.status(500).send({ error: 'internal_error', message: GENERIC_ERROR_MESSAGE });
};

export const registerAdminPlaceAccountRoutes = async (app: FastifyInstance): Promise<void> => {
  app.get('/v1/admin/places/:id/account', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const { id } = placeIdParamSchema.parse(request.params);
      const record = await adminPlaceAccountService.getByPlaceId(id);
      return reply.send(toPlaceAccountResponse(record));
    } catch (error) {
      return handleError(reply, error, 'GET /v1/admin/places/:id/account');
    }
  });

  app.post('/v1/admin/places/:id/account', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const { id } = placeIdParamSchema.parse(request.params);
      const body = createPlaceAccountSchema.parse(request.body);
      const record = await adminPlaceAccountService.create(id, body);
      return reply.status(201).send(toPlaceAccountCreatedResponse(record));
    } catch (error) {
      return handleError(reply, error, 'POST /v1/admin/places/:id/account');
    }
  });

  app.patch('/v1/admin/places/:id/account', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const { id } = placeIdParamSchema.parse(request.params);
      const body = updatePlaceAccountSchema.parse(request.body);
      const record = await adminPlaceAccountService.setActive(id, body.isActive);
      return reply.send(toPlaceAccountResponse(record));
    } catch (error) {
      return handleError(reply, error, 'PATCH /v1/admin/places/:id/account');
    }
  });

  app.post('/v1/admin/places/:id/account/reset-password', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const { id } = placeIdParamSchema.parse(request.params);
      const temporaryPassword = await adminPlaceAccountService.resetPassword(id);
      return reply.send(toResetPlacePasswordResponse(temporaryPassword));
    } catch (error) {
      return handleError(reply, error, 'POST /v1/admin/places/:id/account/reset-password');
    }
  });
};
