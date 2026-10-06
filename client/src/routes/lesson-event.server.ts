import { calendarEventOf } from '~/lessonCalendar/helpers';

import { calendarResponse } from './calendar-response.server';
import { loadLessonOccurrence } from './lesson.server';
import { serializeCalendar } from './ics.server';

// The `.server` suffix is React Router's build-time boundary: see
// rabbis.$rabbiId/rabbi-detail.server.ts for why the service code behind
// `loadLessonOccurrence` is excluded from the browser bundle.

// ASCII on purpose: a Hebrew filename in Content-Disposition needs the
// RFC 8187 encoding that older mail and calendar clients still get wrong.
const EVENT_FILE_DISPOSITION = 'attachment; filename="lesson.ics"';

// The one-off file is never revised, so it carries no revision. Its DTSTAMP
// is midnight UTC of the current day rather than the moment of the request,
// which keeps the body, and so the ETag, stable for the day. `getOccurrence`
// does not expose the lesson's last-update time (the feed's source), and a
// file that is imported once has no use for it.
const startOfUtcDay = (instant: Date): Date =>
  new Date(Date.UTC(instant.getUTCFullYear(), instant.getUTCMonth(), instant.getUTCDate()));

// Validation and the 400, 404 and 500 mapping are `loadLessonOccurrence`'s,
// the same as the lesson page's own loader: a lesson that exists but has no
// occurrence on the date is a 404 here exactly as it is there.
export const buildLessonEventResponse = async (
  request: Request,
  rawLessonId: string | undefined,
  rawDate: string | undefined,
): Promise<Response> => {
  const now = new Date();
  const occurrence = await loadLessonOccurrence(rawLessonId ?? '', rawDate ?? '', now);

  const body = serializeCalendar([{ event: calendarEventOf(occurrence, 'static'), stampedAt: startOfUtcDay(now) }]);
  return calendarResponse(request, body, { 'Content-Disposition': EVENT_FILE_DISPOSITION });
};
