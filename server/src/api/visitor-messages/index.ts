import type { FastifyInstance, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

import { createVisitorMessageSchema } from '../../service/visitor-message/models';
import * as visitorMessageService from '../../service/visitor-message/visitor-message';

const GENERIC_ERROR_MESSAGE = 'אירעה שגיאה בשרת, נסו שוב מאוחר יותר';
const INVALID_REQUEST_MESSAGE = 'הבקשה אינה תקינה';

const handleError = (reply: FastifyReply, error: unknown): FastifyReply => {
  if (error instanceof ZodError) {
    return reply.status(400).send({ error: 'invalid_request', message: INVALID_REQUEST_MESSAGE, details: error.flatten() });
  }

  reply.request.log.error({ err: error }, 'unhandled error in POST /v1/visitor-messages');
  return reply.status(500).send({ error: 'internal_error', message: GENERIC_ERROR_MESSAGE });
};

export const registerVisitorMessageRoutes = async (app: FastifyInstance): Promise<void> => {
  // Public. 204 means stored, whether or not the Telegram alert went out.
  // Only the message id, the type and the alert outcome are ever logged:
  // never the name, the phone or the text.
  app.post('/v1/visitor-messages', async (request, reply) => {
    try {
      const body = createVisitorMessageSchema.parse(request.body);
      const { id, type, alert } = await visitorMessageService.submit(body);

      if (typeof alert === 'object') {
        request.log.warn({ err: alert.failed, messageId: id, type }, 'visitor message saved but the Telegram alert failed');
      } else {
        request.log.info({ messageId: id, type, alert }, 'visitor message saved');
      }
      return reply.status(204).send();
    } catch (error) {
      return handleError(reply, error);
    }
  });
};
