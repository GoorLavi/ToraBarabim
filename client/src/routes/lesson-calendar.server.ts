import type { LessonOccurrence } from '@torabarabim/common';
import { ZodError } from 'zod';

import { calendarEventOf } from '~/lessonCalendar/helpers';

import { toLessonOccurrence } from '../../../server/src/convertors/lesson';
import { LessonNotFoundError } from '../../../server/src/service/lesson/errors';
import * as lessonService from '../../../server/src/service/lesson/lesson';
import { lessonOccurrenceParamsSchema } from '../../../server/src/service/lesson/models';
import { SITE_NAME } from '../../consts';
import { calendarResponse } from './calendar-response.server';
import { CALENDAR_FEED_REFRESH_HOURS, UNCACHEABLE_ERROR_HEADERS } from './consts';
import { serializeCalendar } from './ics.server';
import type { IcsEntry } from './models';

// The `.server` suffix is React Router's build-time boundary: see
// rabbis.$rabbiId/rabbi-detail.server.ts for why the service code below is
// excluded from the browser bundle.

// A subscriber's calendar names the feed once, and every later date inherits
// that name, so it is the lesson's own subject line: never prefixed as
// cancelled and never naming a substitute, both of which describe one date.
const feedNameOf = (firstOccurrence: LessonOccurrence | undefined): string => {
  if (!firstOccurrence) return SITE_NAME;
  return calendarEventOf({ ...firstOccurrence, status: 'scheduled', substituteRabbi: undefined }, 'feed').summary;
};

// A well-formed id that names no lesson answers an empty calendar, not a 404
// (decision for the feed in the plan, section 6): a lesson is hard-deleted,
// and a 404 would leave every subscriber's calendar holding events for a
// page that no longer exists, while an empty calendar clears them. Fails
// open for exactly that one condition; a malformed id is still a 400 and a
// database failure still a 500.
export const buildLessonCalendarResponse = async (request: Request, rawLessonId: string | undefined): Promise<Response> => {
  try {
    const lessonId = lessonOccurrenceParamsSchema.shape.lessonId.parse(rawLessonId);
    const records = await lessonService.getCalendarOccurrences(lessonId, new Date()).catch((error: unknown) => {
      if (error instanceof LessonNotFoundError) return [];
      throw error;
    });

    const dated = records.map((record) => ({ occurrence: toLessonOccurrence(record), revisedAt: record.revisedAt }));
    const entries: IcsEntry[] = dated.map(({ occurrence, revisedAt }) => ({
      event: calendarEventOf(occurrence, 'feed'),
      stampedAt: revisedAt,
      revisedAt,
    }));

    const body = serializeCalendar(entries, {
      name: feedNameOf(dated[0]?.occurrence),
      refreshIntervalHours: CALENDAR_FEED_REFRESH_HOURS,
    });
    return calendarResponse(request, body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Response('בקשה לא תקינה', { status: 400, headers: UNCACHEABLE_ERROR_HEADERS });
    }
    console.error('Failed to build lesson calendar feed', { lessonId: rawLessonId, error });
    throw new Response(null, { status: 500, headers: UNCACHEABLE_ERROR_HEADERS });
  }
};
