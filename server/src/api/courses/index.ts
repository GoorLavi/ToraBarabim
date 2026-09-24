import type { FastifyInstance, FastifyReply } from 'fastify';
import { z, ZodError } from 'zod';

import { toCourseDetailResponse } from '../../convertors/course';
import * as courseService from '../../service/course/course';
import { CourseNotFoundError } from '../../service/course/errors';

const GENERIC_ERROR_MESSAGE = 'אירעה שגיאה בשרת, נסו שוב מאוחר יותר';
const COURSE_NOT_FOUND_MESSAGE = 'הקורס המבוקש לא נמצא';

const courseIdParamSchema = z.object({ courseId: z.string().trim().min(1) });

const handleError = (reply: FastifyReply, error: unknown, routeLabel: string): FastifyReply => {
  if (error instanceof ZodError) {
    return reply.status(400).send({ error: 'invalid_request', message: 'הבקשה אינה תקינה', details: error.flatten() });
  }

  if (error instanceof CourseNotFoundError) {
    return reply.status(404).send({ error: 'not_found', message: COURSE_NOT_FOUND_MESSAGE });
  }

  reply.request.log.error({ err: error }, `unhandled error in ${routeLabel}`);
  return reply.status(500).send({ error: 'internal_error', message: GENERIC_ERROR_MESSAGE });
};

// The public course surface: one route, the shareable detail page. Every
// other public course read (the home row, a rabbi's or place's page, the
// women's area) is embedded in that surface's own response, never a route
// of its own.
export const registerCourseRoutes = async (app: FastifyInstance): Promise<void> => {
  app.get('/v1/courses/:courseId', async (request, reply) => {
    try {
      const { courseId } = courseIdParamSchema.parse(request.params);
      const record = await courseService.getPublicById(courseId, new Date());
      return reply.send(toCourseDetailResponse(record));
    } catch (error) {
      return handleError(reply, error, 'GET /v1/courses/:courseId');
    }
  });
};
