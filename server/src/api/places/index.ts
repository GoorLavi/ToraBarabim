import type { FastifyInstance, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

import { toPlaceDetailResponse, toPlaceListResponse, toPlaceSimilarResponse } from '../../convertors/place-directory';
import { PlaceNotFoundError } from '../../service/place/errors';
import { placeIdParamSchema, similarPlaceQuerySchema } from '../../service/place/models';
import * as placeService from '../../service/place/place';

const GENERIC_ERROR_MESSAGE = 'אירעה שגיאה בשרת, נסו שוב מאוחר יותר';

const handleError = (reply: FastifyReply, error: unknown, routeLabel: string): FastifyReply => {
  if (error instanceof ZodError) {
    return reply.status(400).send({ error: 'invalid_request', message: 'הבקשה אינה תקינה', details: error.flatten() });
  }

  if (error instanceof PlaceNotFoundError) {
    return reply.status(404).send({ error: 'place_not_found', message: 'המקום המבוקש לא נמצא' });
  }

  reply.request.log.error({ err: error }, `unhandled error in ${routeLabel}`);
  return reply.status(500).send({ error: 'internal_error', message: GENERIC_ERROR_MESSAGE });
};

// The public place directory: everything it can return is already public
// on a lesson's own venue, so none of this needs authentication.
export const registerPlaceRoutes = async (app: FastifyInstance): Promise<void> => {
  app.get('/v1/places', async (_request, reply) => {
    try {
      const result = await placeService.list();
      return reply.send(toPlaceListResponse(result));
    } catch (error) {
      return handleError(reply, error, 'GET /v1/places');
    }
  });

  // Static, so find-my-way matches it before the `/:id` param route below
  // regardless of registration order; no place id is ever literally "similar".
  app.get('/v1/places/similar', async (request, reply) => {
    try {
      const query = similarPlaceQuerySchema.parse(request.query);
      const result = await placeService.findSimilar(query);
      return reply.send(toPlaceSimilarResponse(result));
    } catch (error) {
      return handleError(reply, error, 'GET /v1/places/similar');
    }
  });

  app.get('/v1/places/:id', async (request, reply) => {
    try {
      const { id } = placeIdParamSchema.parse(request.params);
      const result = await placeService.getById(id);
      return reply.send(toPlaceDetailResponse(result));
    } catch (error) {
      return handleError(reply, error, 'GET /v1/places/:id');
    }
  });
};
