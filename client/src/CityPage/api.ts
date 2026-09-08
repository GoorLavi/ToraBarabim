import type { Area, CityDetailResponse, LessonSearchResponse } from '@torabarabim/common';

// Carries the HTTP status so a caller can map it to Hebrew copy without
// parsing `message` (mirrors RabbiPage/api.ts's RabbiPageApiError).
export class CityPageApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'CityPageApiError';
  }
}

const fetchJson = async <T>(url: URL, signal?: AbortSignal): Promise<T> => {
  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new CityPageApiError(0, `failed to reach ${url.toString()}: ${String(error)}`);
  }

  if (!response.ok) {
    throw new CityPageApiError(response.status, `GET ${url.toString()} returned ${response.status}`);
  }

  return (await response.json()) as T;
};

// GET /v1/cities/:name
// 200 with CityDetailResponse: this is what turns the city's Hebrew name
// into the numeric code GET /v1/lessons's `city` filter expects.
// 404 when no city has this exact name.
// 5xx for a server or upstream failure.
export const fetchCityDetail = (cityName: string, signal?: AbortSignal): Promise<CityDetailResponse> =>
  fetchJson(new URL(`/v1/cities/${encodeURIComponent(cityName)}`, window.location.origin), signal);

// GET /v1/lessons
// 200 with LessonSearchResponse, including an empty result set: a real city
// with no lessons is a 200, never a 404.
// 400 for an invalid query.
// 5xx for a server or upstream failure.
export const fetchLessons = (
  params: { city?: string; area?: Area; pageSize?: number },
  signal?: AbortSignal,
): Promise<LessonSearchResponse> => {
  const url = new URL('/v1/lessons', window.location.origin);
  if (params.city) url.searchParams.set('city', params.city);
  if (params.area) url.searchParams.set('area', params.area);
  if (params.pageSize) url.searchParams.set('pageSize', String(params.pageSize));
  return fetchJson(url, signal);
};
