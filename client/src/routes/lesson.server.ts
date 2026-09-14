import type { LessonOccurrence } from '@torabarabim/common';
import { ZodError } from 'zod';

import { toLessonOccurrence } from '../../../server/src/convertors/lesson';
import { LessonNotFoundError, LessonOccurrenceNotFoundError } from '../../../server/src/service/lesson/errors';
import * as lessonService from '../../../server/src/service/lesson/lesson';
import { lessonOccurrenceParamsSchema } from '../../../server/src/service/lesson/models';
import { UNCACHEABLE_ERROR_HEADERS } from './consts';

// The `.server` suffix is React Router's build-time boundary: see
// rabbis.$rabbiId/rabbi-detail.server.ts for why the service, database, and
// validation schema below cannot reach the browser bundle.

// Validated with the same schema the JSON API's own route uses
// (server/src/api/lessons/index.ts), so a malformed id or date gets the
// same 400 here that it would get there, before it ever reaches the
// service. A lesson that exists but has no occurrence on the requested date
// is indistinguishable from a lesson that does not exist at all, mirroring
// the API's own handleError.
export const loadLessonOccurrence = async (rawLessonId: string, rawDate: string): Promise<LessonOccurrence> => {
  try {
    const { lessonId, date } = lessonOccurrenceParamsSchema.parse({ lessonId: rawLessonId, date: rawDate });
    const record = await lessonService.getOccurrence(lessonId, date);
    return toLessonOccurrence(record);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Response('בקשה לא תקינה', { status: 400, headers: UNCACHEABLE_ERROR_HEADERS });
    }
    if (error instanceof LessonNotFoundError || error instanceof LessonOccurrenceNotFoundError) {
      throw new Response('השיעור לא נמצא', { status: 404, headers: UNCACHEABLE_ERROR_HEADERS });
    }
    console.error('Failed to load lesson occurrence', { lessonId: rawLessonId, date: rawDate, error });
    throw new Response(null, { status: 500, headers: UNCACHEABLE_ERROR_HEADERS });
  }
};
