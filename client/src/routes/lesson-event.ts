import type { LoaderFunctionArgs } from 'react-router';

import { buildLessonEventResponse } from './lesson-event.server';

// A resource route, like sitemap.ts: no component, so the `Response` the
// loader returns is the whole HTTP response.
export const loader = ({ request, params }: LoaderFunctionArgs): Promise<Response> =>
  buildLessonEventResponse(request, params.lessonId, params.date);
