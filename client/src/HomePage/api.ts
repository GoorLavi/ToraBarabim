import type { City, LessonSearchResponse } from '@torabarabim/common';

import type { LessonFilters } from './models';

// Carries the HTTP status so a caller can map it to Hebrew copy without
// parsing `message`. Status 0 marks a request that never reached the
// server (offline, DNS, CORS), which has no HTTP status of its own.
export class HomeApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'HomeApiError';
  }
}

// GET /v1/lessons
// 200 on success, including an empty result set.
// 400 for an invalid query (bad date range, page size over the max).
// 5xx for a server or upstream failure.
export const fetchLessons = async (filters: LessonFilters): Promise<LessonSearchResponse> => {
  const url = new URL('/v1/lessons', window.location.origin);
  url.searchParams.set('from', filters.from);
  url.searchParams.set('to', filters.to);
  if (filters.city) url.searchParams.set('city', filters.city);
  if (filters.pageSize) url.searchParams.set('pageSize', String(filters.pageSize));
  if (filters.q) url.searchParams.set('q', filters.q);

  let response: Response;
  try {
    response = await fetch(url);
  } catch (error) {
    throw new HomeApiError(0, `failed to reach ${url.toString()}: ${String(error)}`);
  }

  if (!response.ok) {
    throw new HomeApiError(response.status, `GET ${url.toString()} returned ${response.status}`);
  }

  return (await response.json()) as LessonSearchResponse;
};

// GET /v1/cities
// 200 on success, including an empty result set (an empty or missing `q`
// resolves to no results server-side, never a 404: root CLAUDE.md, HTTP
// Status Codes).
// 400 for an invalid query.
// 5xx for a server or upstream failure.
export const fetchCities = async (q: string): Promise<{ items: City[] }> => {
  const url = new URL('/v1/cities', window.location.origin);
  url.searchParams.set('q', q);

  let response: Response;
  try {
    response = await fetch(url);
  } catch (error) {
    throw new HomeApiError(0, `failed to reach ${url.toString()}: ${String(error)}`);
  }

  if (!response.ok) {
    throw new HomeApiError(response.status, `GET ${url.toString()} returned ${response.status}`);
  }

  return (await response.json()) as { items: City[] };
};
