import type { FastifyInstance, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

import { toAreaDetailResponse, toAreaDirectoryResponse } from '../../convertors/area';
import * as areaService from '../../service/area/area';
import { AreaNotFoundError } from '../../service/area/errors';
import { areaSlugParamSchema } from '../../service/area/models';

const GENERIC_ERROR_MESSAGE = 'אירעה שגיאה בשרת, נסו שוב מאוחר יותר';

const handleError = (reply: FastifyReply, error: unknown, routeLabel: string): FastifyReply => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: 'invalid_request',
      message: 'הבקשה אינה תקינה',
      details: error.flatten(),
    });
  }

  if (error instanceof AreaNotFoundError) {
    return reply.status(404).send({ error: 'area_not_found', message: 'האזור המבוקש לא נמצא' });
  }

  reply.request.log.error({ err: error }, `unhandled error in ${routeLabel}`);
  return reply.status(500).send({ error: 'internal_error', message: GENERIC_ERROR_MESSAGE });
};

export const registerAreaRoutes = async (app: FastifyInstance): Promise<void> => {
  app.get('/v1/areas', async (request, reply) => {
    try {
      const result = await areaService.listDirectory();
      return reply.send(toAreaDirectoryResponse(result));
    } catch (error) {
      return handleError(reply, error, 'GET /v1/areas');
    }
  });

  app.get('/v1/areas/:slug', async (request, reply) => {
    try {
      const { slug } = areaSlugParamSchema.parse(request.params);
      const result = await areaService.resolveBySlug(slug);
      return reply.send(toAreaDetailResponse(result));
    } catch (error) {
      return handleError(reply, error, 'GET /v1/areas/:slug');
    }
  });
};
