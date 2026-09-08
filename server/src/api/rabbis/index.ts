import type { FastifyInstance, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

import { toRabbiDetailResponse, toRabbiDirectoryResponse } from '../../convertors/rabbi-directory';
import { RabbiNotFoundError } from '../../service/rabbi/errors';
import * as rabbiService from '../../service/rabbi/rabbi';
import { rabbiIdParamSchema, rabbiListQuerySchema } from '../../service/rabbi/models';

const GENERIC_ERROR_MESSAGE = 'אירעה שגיאה בשרת, נסו שוב מאוחר יותר';

const handleError = (reply: FastifyReply, error: unknown, routeLabel: string): FastifyReply => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: 'invalid_request',
      message: 'הבקשה אינה תקינה',
      details: error.flatten(),
    });
  }

  if (error instanceof RabbiNotFoundError) {
    return reply.status(404).send({ error: 'rabbi_not_found', message: 'הרב המבוקש לא נמצא' });
  }

  reply.request.log.error({ err: error }, `unhandled error in ${routeLabel}`);
  return reply.status(500).send({ error: 'internal_error', message: GENERIC_ERROR_MESSAGE });
};

// The public rabbi directory: `/v1/rabbis` for the index page, `/v1/rabbis/:rabbiId`
// for a single rabbi's page. Distinct from `registerRabbiRoutes` (`/v1/rabbi/...`),
// which serves an authenticated rabbi's own self-service endpoints.
export const registerRabbiDirectoryRoutes = async (app: FastifyInstance): Promise<void> => {
  app.get('/v1/rabbis', async (request, reply) => {
    try {
      const query = rabbiListQuerySchema.parse(request.query);
      const result = await rabbiService.list(query);
      return reply.send(toRabbiDirectoryResponse(result));
    } catch (error) {
      return handleError(reply, error, 'GET /v1/rabbis');
    }
  });

  app.get('/v1/rabbis/:rabbiId', async (request, reply) => {
    try {
      const { rabbiId } = rabbiIdParamSchema.parse(request.params);
      const result = await rabbiService.getById(rabbiId);
      return reply.send(toRabbiDetailResponse(result));
    } catch (error) {
      return handleError(reply, error, 'GET /v1/rabbis/:rabbiId');
    }
  });
};
