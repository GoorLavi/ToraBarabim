import type { FastifyInstance, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

import { toCityDetailResponse, toCityDirectoryResponse, toCityList, toCitySuggestionsResponse } from '../../convertors/city';
import { CityNotFoundError } from '../../service/city/errors';
import * as cityService from '../../service/city/city';
import { citySearchQuerySchema, citySlugParamSchema } from '../../service/city/models';

const GENERIC_ERROR_MESSAGE = 'אירעה שגיאה בשרת, נסו שוב מאוחר יותר';

const handleError = (reply: FastifyReply, error: unknown, routeLabel: string): FastifyReply => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: 'invalid_request',
      message: 'הבקשה אינה תקינה',
      details: error.flatten(),
    });
  }

  if (error instanceof CityNotFoundError) {
    return reply.status(404).send({ error: 'city_not_found', message: 'העיר המבוקשת לא נמצאה' });
  }

  reply.request.log.error({ err: error }, `unhandled error in ${routeLabel}`);
  return reply.status(500).send({ error: 'internal_error', message: GENERIC_ERROR_MESSAGE });
};

export const registerCityRoutes = async (app: FastifyInstance): Promise<void> => {
  app.get('/v1/cities', async (request, reply) => {
    try {
      const query = citySearchQuerySchema.parse(request.query);
      const result = await cityService.search(query);
      return reply.send(toCityList(result));
    } catch (error) {
      return handleError(reply, error, 'GET /v1/cities');
    }
  });

  // Static, so find-my-way matches it before the `/:slug` param route below
  // regardless of registration order; no city ever slugifies to "directory".
  app.get('/v1/cities/directory', async (request, reply) => {
    try {
      const result = await cityService.listDirectory();
      return reply.send(toCityDirectoryResponse(result));
    } catch (error) {
      return handleError(reply, error, 'GET /v1/cities/directory');
    }
  });

  // Static, for the same reason as `/v1/cities/directory` above; no city
  // ever slugifies to "suggestions" either.
  app.get('/v1/cities/suggestions', async (request, reply) => {
    try {
      const result = await cityService.listSuggestions();
      return reply.send(toCitySuggestionsResponse(result));
    } catch (error) {
      return handleError(reply, error, 'GET /v1/cities/suggestions');
    }
  });

  app.get('/v1/cities/:slug', async (request, reply) => {
    try {
      const { slug } = citySlugParamSchema.parse(request.params);
      const result = await cityService.resolveBySlug(slug);
      return reply.send(toCityDetailResponse(result));
    } catch (error) {
      return handleError(reply, error, 'GET /v1/cities/:slug');
    }
  });
};
