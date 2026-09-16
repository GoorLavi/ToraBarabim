import type { City, CityDetailResponse, LessonSearchResponse, WomenAreaResponse } from '@torabarabim/common';

import type { WomenLessonsParams } from './models';

// Carries the HTTP status so a caller can map it to Hebrew copy without
// parsing `message`, mirroring CityPage/api.ts's CityPageApiError.
export class WomenPageApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'WomenPageApiError';
  }
}

const fetchJson = async <T>(url: URL, signal?: AbortSignal): Promise<T> => {
  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new WomenPageApiError(0, `failed to reach ${url.toString()}: ${String(error)}`);
  }

  if (!response.ok) {
    throw new WomenPageApiError(response.status, `GET ${url.toString()} returned ${response.status}`);
  }

  return (await response.json()) as T;
};

// GET /v1/women, no query parameters.
// 200 with WomenAreaResponse, both the `populated` and `empty` branch.
// 5xx for a server or upstream failure. The one fetcher for this route: the
// home page reads its own count from `GET /v1/home` instead of calling this
// a second time (HomePage/HomePage.tsx).
export const fetchWomenAreaSummary = (signal?: AbortSignal): Promise<WomenAreaResponse> =>
  fetchJson(new URL('/v1/women', window.location.origin), signal);

// GET /v1/lessons?scope=women
// 200 with LessonSearchResponse, including an empty result set.
// 400 for an invalid query. `scope=women` itself is never invalid: only a
// bare `audience=women` is (server/src/service/lesson/models.ts).
// 5xx for a server or upstream failure.
export const fetchWomenLessons = (params: WomenLessonsParams, signal?: AbortSignal): Promise<LessonSearchResponse> => {
  const url = new URL('/v1/lessons', window.location.origin);
  url.searchParams.set('scope', 'women');
  if (params.city) url.searchParams.set('city', params.city);
  if (params.area) url.searchParams.set('area', params.area);
  if (params.from) url.searchParams.set('from', params.from);
  if (params.to) url.searchParams.set('to', params.to);
  if (params.q) url.searchParams.set('q', params.q);
  if (params.page) url.searchParams.set('page', String(params.page));
  if (params.pageSize) url.searchParams.set('pageSize', String(params.pageSize));
  return fetchJson(url, signal);
};

// GET /v1/cities?q=
// 200 with `{ items: City[] }`, including an empty result set.
// 400 for an invalid query.
// 5xx for a server or upstream failure.
export const fetchCities = (q: string, signal?: AbortSignal): Promise<{ items: City[] }> => {
  const url = new URL('/v1/cities', window.location.origin);
  url.searchParams.set('q', q);
  return fetchJson(url, signal);
};

// GET /v1/cities/:slug
// 200 with CityDetailResponse, whose `areaName`/`areaSlug` are the only
// source of a human-readable area label the client has (city.ts,
// `rabbiDisplayName`'s sibling rule: never a client-side Area map).
// 404 when no city has this slug.
// 5xx for a server or upstream failure.
export const fetchCityDetail = (citySlug: string, signal?: AbortSignal): Promise<CityDetailResponse> =>
  fetchJson(new URL(`/v1/cities/${encodeURIComponent(citySlug)}`, window.location.origin), signal);
