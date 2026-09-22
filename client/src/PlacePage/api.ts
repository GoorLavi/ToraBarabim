import type { Area, CityDetailResponse, LessonSearchResponse, PlaceDetailResponse } from '@torabarabim/common';

// Carries the HTTP status so a caller can map it to Hebrew copy without
// parsing `message` (mirrors CityPage/api.ts's CityPageApiError). Status 0
// marks a request that never reached the server.
export class PlacePageApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'PlacePageApiError';
  }
}

const fetchJson = async <T>(url: URL, signal?: AbortSignal): Promise<T> => {
  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new PlacePageApiError(0, `failed to reach ${url.toString()}: ${String(error)}`);
  }

  if (!response.ok) {
    throw new PlacePageApiError(response.status, `GET ${url.toString()} returned ${response.status}`);
  }

  return (await response.json()) as T;
};

// GET /v1/places/:id
// 200 with PlaceDetailResponse.
// 404 when the place does not exist, or has been deactivated (deactivation
// is reversible and answers the same 404 as never having existed).
// 5xx for a server or upstream failure.
export const fetchPlaceDetail = (placeId: string, signal?: AbortSignal): Promise<PlaceDetailResponse> =>
  fetchJson(new URL(`/v1/places/${encodeURIComponent(placeId)}`, window.location.origin), signal);

// GET /v1/lessons
// 200 with LessonSearchResponse, including an empty result set: a real
// place, city or area with no lessons is a 200, never a 404.
// 400 for an invalid query.
// 5xx for a server or upstream failure.
export const fetchLessons = (
  params: { placeId?: string; city?: string; area?: Area; page?: number; pageSize?: number },
  signal?: AbortSignal,
): Promise<LessonSearchResponse> => {
  const url = new URL('/v1/lessons', window.location.origin);
  if (params.placeId) url.searchParams.set('placeId', params.placeId);
  if (params.city) url.searchParams.set('city', params.city);
  if (params.area) url.searchParams.set('area', params.area);
  if (params.page) url.searchParams.set('page', String(params.page));
  if (params.pageSize) url.searchParams.set('pageSize', String(params.pageSize));
  return fetchJson(url, signal);
};

// GET /v1/cities/:slug
// 200 with CityDetailResponse: resolves the place's own city slug into the
// numeric code the "widen to city" fallback's GET /v1/lessons call needs.
// A place record carries the city's slug and display name, never its
// numeric code (common/src/venue.ts, Place), so this hop is unavoidable
// (useWidenedCityLessons.ts).
// 404 when no city has this slug.
// 5xx for a server or upstream failure.
export const fetchCityDetail = (citySlug: string, signal?: AbortSignal): Promise<CityDetailResponse> =>
  fetchJson(new URL(`/v1/cities/${encodeURIComponent(citySlug)}`, window.location.origin), signal);
