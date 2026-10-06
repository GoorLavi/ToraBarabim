import type { LoaderFunctionArgs } from 'react-router';

import { buildLessonCalendarResponse } from './lesson-calendar.server';

// A resource route, like sitemap.ts: no component, so the `Response` the
// loader returns is the whole HTTP response. This URL is a contract with
// every subscriber's calendar and is never renamed.
export const loader = ({ request, params }: LoaderFunctionArgs): Promise<Response> =>
  buildLessonCalendarResponse(request, params.lessonId);
