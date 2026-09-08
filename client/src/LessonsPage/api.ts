import type { LessonSearchResponse } from '@torabarabim/common';

import type { LessonsFilters } from './models';

// Carries the HTTP status so a caller can map it to Hebrew copy without
// parsing `message`. Status 0 marks a request that never reached the
// server (offline, DNS, CORS), which has no HTTP status of its own.
export class LessonsApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'LessonsApiError';
  }
}

// GET /v1/lessons
// 200 on success, including an empty result set.
// 400 for an invalid query (bad date range, page size over the max, or an
// unrecognised area/topic/audience carried in from the URL).
// 5xx for a server or upstream failure.
export const fetchLessons = async (filters: LessonsFilters, page: number): Promise<LessonSearchResponse> => {
  const url = new URL('/v1/lessons', window.location.origin);
  url.searchParams.set('from', filters.from);
  url.searchParams.set('to', filters.to);
  url.searchParams.set('page', String(page));
  url.searchParams.set('pageSize', String(filters.pageSize));
  if (filters.city) url.searchParams.set('city', filters.city);
  if (filters.q) url.searchParams.set('q', filters.q);
  if (filters.rabbiId) url.searchParams.set('rabbiId', filters.rabbiId);
  if (filters.area) url.searchParams.set('area', filters.area);
  if (filters.topic) url.searchParams.set('topic', filters.topic);
  if (filters.audience) url.searchParams.set('audience', filters.audience);

  let response: Response;
  try {
    response = await fetch(url);
  } catch (error) {
    throw new LessonsApiError(0, `failed to reach ${url.toString()}: ${String(error)}`);
  }

  if (!response.ok) {
    throw new LessonsApiError(response.status, `GET ${url.toString()} returned ${response.status}`);
  }

  return (await response.json()) as LessonSearchResponse;
};
