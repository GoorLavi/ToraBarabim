import type { FastifyInstance, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

import { toAdminVisitorMessage, toVisitorMessageListResponse } from '../../../convertors/admin-visitor-message';
import { requireAdminAuth, requireSuperAdmin } from '../../../plugins/admin-guard';
import { VisitorMessageNotFoundError } from '../../../service/visitor-message/errors';
import {
  updateVisitorMessageSchema,
  visitorMessageIdParamSchema,
  visitorMessageListQuerySchema,
} from '../../../service/visitor-message/models';
import * as visitorMessageService from '../../../service/visitor-message/visitor-message';

const GENERIC_ERROR_MESSAGE = 'אירעה שגיאה בשרת, נסו שוב מאוחר יותר';
const VISITOR_MESSAGE_NOT_FOUND_MESSAGE = 'ההודעה המבוקשת לא נמצאה';

// Messages carry visitors' names and phones, so the panel is reachable only
// by the super admin (0020).
const superAdminOnly = [requireAdminAuth, requireSuperAdmin];

const handleError = (reply: FastifyReply, error: unknown, routeLabel: string): FastifyReply => {
  if (error instanceof ZodError) {
    return reply.status(400).send({ error: 'invalid_request', message: 'הבקשה אינה תקינה', details: error.flatten() });
  }

  if (error instanceof VisitorMessageNotFoundError) {
    return reply.status(404).send({ error: 'not_found', message: VISITOR_MESSAGE_NOT_FOUND_MESSAGE });
  }

  reply.request.log.error({ err: error }, `unhandled error in ${routeLabel}`);
  return reply.status(500).send({ error: 'internal_error', message: GENERIC_ERROR_MESSAGE });
};

export const registerAdminVisitorMessageRoutes = async (app: FastifyInstance): Promise<void> => {
  app.get('/v1/admin/visitor-messages', { preHandler: superAdminOnly }, async (request, reply) => {
    try {
      const query = visitorMessageListQuerySchema.parse(request.query);
      const result = await visitorMessageService.list(query);
      return reply.send(toVisitorMessageListResponse(result));
    } catch (error) {
      return handleError(reply, error, 'GET /v1/admin/visitor-messages');
    }
  });

  app.patch('/v1/admin/visitor-messages/:id', { preHandler: superAdminOnly }, async (request, reply) => {
    try {
      const { id } = visitorMessageIdParamSchema.parse(request.params);
      const body = updateVisitorMessageSchema.parse(request.body);
      const record = await visitorMessageService.update(id, body);
      return reply.send(toAdminVisitorMessage(record));
    } catch (error) {
      return handleError(reply, error, 'PATCH /v1/admin/visitor-messages/:id');
    }
  });
};
