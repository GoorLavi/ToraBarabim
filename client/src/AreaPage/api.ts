import type { Area, AreaDetailResponse, AreaDirectoryResponse, LessonSearchResponse } from '@torabarabim/common';

// Carries the HTTP status so a caller can map it to Hebrew copy without
// parsing `message` (mirrors CityPage/api.ts's CityPageApiError).
export class AreaPageApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'AreaPageApiError';
  }
}

const fetchJson = async <T>(url: URL, signal?: AbortSignal): Promise<T> => {
  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new AreaPageApiError(0, `failed to reach ${url.toString()}: ${String(error)}`);
  }

  if (!response.ok) {
    throw new AreaPageApiError(response.status, `GET ${url.toString()} returned ${response.status}`);
  }

  return (await response.json()) as T;
};

// GET /v1/areas/:slug
// 200 with AreaDetailResponse: this is what turns the area's slug into the
// `Area` enum GET /v1/lessons's `area` filter expects.
// 404 when no area has this slug.
// 5xx for a server or upstream failure.
export const fetchAreaDetail = (areaSlug: string, signal?: AbortSignal): Promise<AreaDetailResponse> =>
  fetchJson(new URL(`/v1/areas/${encodeURIComponent(areaSlug)}`, window.location.origin), signal);

// GET /v1/lessons
// 200 with LessonSearchResponse, including an empty result set: a real area
// with no lessons in the window is a 200, never a 404.
// 400 for an invalid query.
// 5xx for a server or upstream failure.
export const fetchLessons = (
  params: { area: Area | undefined; pageSize: number },
  signal?: AbortSignal,
): Promise<LessonSearchResponse> => {
  const url = new URL('/v1/lessons', window.location.origin);
  if (params.area) url.searchParams.set('area', params.area);
  url.searchParams.set('pageSize', String(params.pageSize));
  return fetchJson(url, signal);
};

// GET /v1/areas, no parameters.
// 200 with AreaDirectoryResponse, holding only areas that actually have a
// lesson: the sideways widening this page's genuinely-empty case offers.
// 5xx for a server or upstream failure.
export const fetchAreaDirectory = (signal?: AbortSignal): Promise<AreaDirectoryResponse> =>
  fetchJson(new URL('/v1/areas', window.location.origin), signal);
