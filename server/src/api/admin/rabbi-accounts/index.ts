import type { FastifyInstance, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

import { toRabbiAccountCreatedResponse, toRabbiAccountResponse, toResetRabbiPasswordResponse } from '../../../convertors/admin-rabbi-account';
import { requireAdminAuth } from '../../../plugins/admin-guard';
import * as adminRabbiAccountService from '../../../service/admin-rabbi-account/admin-rabbi-account';
import {
  DuplicateEmailError,
  DuplicateUsernameError,
  RabbiAccountAlreadyExistsError,
  RabbiAccountNotFoundError,
  RabbiNotFoundError,
} from '../../../service/admin-rabbi-account/errors';
import { createRabbiAccountSchema, rabbiIdParamSchema, updateRabbiAccountSchema } from '../../../service/admin-rabbi-account/models';

const GENERIC_ERROR_MESSAGE = 'אירעה שגיאה בשרת, נסו שוב מאוחר יותר';
const RABBI_NOT_FOUND_MESSAGE = 'הרב המבוקש לא נמצא';
const ACCOUNT_NOT_FOUND_MESSAGE = 'לרב זה אין עדיין חשבון התחברות';
const ACCOUNT_ALREADY_EXISTS_MESSAGE = 'לרב זה כבר יש חשבון התחברות';

const handleError = (reply: FastifyReply, error: unknown, routeLabel: string): FastifyReply => {
  if (error instanceof ZodError) {
    return reply.status(400).send({ error: 'invalid_request', message: 'הבקשה אינה תקינה', details: error.flatten() });
  }

  if (error instanceof RabbiNotFoundError) {
    return reply.status(404).send({ error: 'not_found', message: RABBI_NOT_FOUND_MESSAGE });
  }

  if (error instanceof RabbiAccountNotFoundError) {
    return reply.status(404).send({ error: 'account_not_found', message: ACCOUNT_NOT_FOUND_MESSAGE });
  }

  if (error instanceof RabbiAccountAlreadyExistsError) {
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

export const registerAdminRabbiAccountRoutes = async (app: FastifyInstance): Promise<void> => {
  app.get('/v1/admin/rabbis/:id/account', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const { id } = rabbiIdParamSchema.parse(request.params);
      const record = await adminRabbiAccountService.getByRabbiId(id);
      return reply.send(toRabbiAccountResponse(record));
    } catch (error) {
      return handleError(reply, error, 'GET /v1/admin/rabbis/:id/account');
    }
  });

  app.post('/v1/admin/rabbis/:id/account', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const { id } = rabbiIdParamSchema.parse(request.params);
      const body = createRabbiAccountSchema.parse(request.body);
      const record = await adminRabbiAccountService.create(id, body);
      return reply.status(201).send(toRabbiAccountCreatedResponse(record));
    } catch (error) {
      return handleError(reply, error, 'POST /v1/admin/rabbis/:id/account');
    }
  });

  app.patch('/v1/admin/rabbis/:id/account', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const { id } = rabbiIdParamSchema.parse(request.params);
      const body = updateRabbiAccountSchema.parse(request.body);
      const record = await adminRabbiAccountService.setActive(id, body.isActive);
      return reply.send(toRabbiAccountResponse(record));
    } catch (error) {
      return handleError(reply, error, 'PATCH /v1/admin/rabbis/:id/account');
    }
  });

  app.post('/v1/admin/rabbis/:id/account/reset-password', { preHandler: requireAdminAuth }, async (request, reply) => {
    try {
      const { id } = rabbiIdParamSchema.parse(request.params);
      const temporaryPassword = await adminRabbiAccountService.resetPassword(id);
      return reply.send(toResetRabbiPasswordResponse(temporaryPassword));
    } catch (error) {
      return handleError(reply, error, 'POST /v1/admin/rabbis/:id/account/reset-password');
    }
  });
};
