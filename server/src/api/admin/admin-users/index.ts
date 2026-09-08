import type { FastifyInstance, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

import { toAdminUserListItem, toAdminUserListResponse } from '../../../convertors/admin-user';
import { requireAdminAuth, requireSuperAdmin } from '../../../plugins/admin-guard';
import * as adminUserService from '../../../service/admin-user/admin-user';
import {
  AdminUserNotFoundError,
  AdminUserStillActiveError,
  CannotDeactivateSelfError,
  CannotModifySuperAdminError,
  DuplicateEmailError,
  DuplicateUsernameError,
  WeakPasswordError,
} from '../../../service/admin-user/errors';
import {
  adminUserIdParamSchema,
  adminUserListQuerySchema,
  createAdminUserSchema,
  setAdminUserPasswordSchema,
  updateAdminUserSchema,
} from '../../../service/admin-user/models';

const GENERIC_ERROR_MESSAGE = 'אירעה שגיאה בשרת, נסו שוב מאוחר יותר';
const ADMIN_USER_NOT_FOUND_MESSAGE = 'המשתמש המבוקש לא נמצא';
const CANNOT_DEACTIVATE_SELF_MESSAGE = 'לא ניתן להשבית את חשבון המשתמש שלך';
const ADMIN_USER_STILL_ACTIVE_MESSAGE = 'אי אפשר למחוק מנהל פעיל, יש להשבית אותו קודם';
const CANNOT_MODIFY_SUPER_ADMIN_MESSAGE = 'לא ניתן להשבית או למחוק את מנהל-העל';

// The whole admin-management surface (list, create, activate/deactivate,
// delete, reset password) is reachable only by the one super admin.
const superAdminOnly = [requireAdminAuth, requireSuperAdmin];

const handleError = (reply: FastifyReply, error: unknown, routeLabel: string): FastifyReply => {
  if (error instanceof ZodError) {
    return reply.status(400).send({ error: 'invalid_request', message: 'הבקשה אינה תקינה', details: error.flatten() });
  }

  if (error instanceof WeakPasswordError) {
    return reply.status(400).send({ error: 'weak_password', message: `הסיסמה חייבת להכיל לפחות ${error.minimumLength} תווים` });
  }

  if (error instanceof AdminUserNotFoundError) {
    return reply.status(404).send({ error: 'not_found', message: ADMIN_USER_NOT_FOUND_MESSAGE });
  }

  if (error instanceof DuplicateEmailError) {
    return reply.status(409).send({ error: 'duplicate_email', message: `כתובת האימייל '${error.email}' כבר בשימוש` });
  }

  if (error instanceof DuplicateUsernameError) {
    return reply.status(409).send({ error: 'duplicate_username', message: `שם המשתמש '${error.username}' כבר בשימוש` });
  }

  if (error instanceof CannotDeactivateSelfError) {
    return reply.status(409).send({ error: 'cannot_deactivate_self', message: CANNOT_DEACTIVATE_SELF_MESSAGE });
  }

  if (error instanceof AdminUserStillActiveError) {
    return reply.status(409).send({ error: 'admin_user_still_active', message: ADMIN_USER_STILL_ACTIVE_MESSAGE });
  }

  if (error instanceof CannotModifySuperAdminError) {
    return reply.status(409).send({ error: 'cannot_modify_super_admin', message: CANNOT_MODIFY_SUPER_ADMIN_MESSAGE });
  }

  reply.request.log.error({ err: error }, `unhandled error in ${routeLabel}`);
  return reply.status(500).send({ error: 'internal_error', message: GENERIC_ERROR_MESSAGE });
};

export const registerAdminUserRoutes = async (app: FastifyInstance): Promise<void> => {
  app.get('/v1/admin/admin-users', { preHandler: superAdminOnly }, async (request, reply) => {
    try {
      const query = adminUserListQuerySchema.parse(request.query);
      const result = await adminUserService.list(query);
      return reply.send(toAdminUserListResponse(result));
    } catch (error) {
      return handleError(reply, error, 'GET /v1/admin/admin-users');
    }
  });

  app.post('/v1/admin/admin-users', { preHandler: superAdminOnly }, async (request, reply) => {
    try {
      const body = createAdminUserSchema.parse(request.body);
      const record = await adminUserService.create(body);
      return reply.status(201).send(toAdminUserListItem(record));
    } catch (error) {
      return handleError(reply, error, 'POST /v1/admin/admin-users');
    }
  });

  app.patch('/v1/admin/admin-users/:id', { preHandler: superAdminOnly }, async (request, reply) => {
    try {
      // requireAdminAuth already sent a 401 and returned when unauthenticated.
      if (!request.adminUser) return reply;
      const { id } = adminUserIdParamSchema.parse(request.params);
      const body = updateAdminUserSchema.parse(request.body);
      const record = await adminUserService.setActive(id, body.isActive, request.adminUser.id);
      return reply.send(toAdminUserListItem(record));
    } catch (error) {
      return handleError(reply, error, 'PATCH /v1/admin/admin-users/:id');
    }
  });

  app.delete('/v1/admin/admin-users/:id', { preHandler: superAdminOnly }, async (request, reply) => {
    try {
      const { id } = adminUserIdParamSchema.parse(request.params);
      await adminUserService.remove(id);
      return reply.status(204).send();
    } catch (error) {
      return handleError(reply, error, 'DELETE /v1/admin/admin-users/:id');
    }
  });

  app.patch('/v1/admin/admin-users/:id/password', { preHandler: superAdminOnly }, async (request, reply) => {
    try {
      const { id } = adminUserIdParamSchema.parse(request.params);
      const body = setAdminUserPasswordSchema.parse(request.body);
      const record = await adminUserService.setPassword(id, body.password);
      return reply.send(toAdminUserListItem(record));
    } catch (error) {
      return handleError(reply, error, 'PATCH /v1/admin/admin-users/:id/password');
    }
  });
};
