import type {
  AdminUser,
  City,
  CreateLessonRequest,
  CreatePlaceRequest,
  CreateRabbiRequest,
  DeleteImpactPreview,
  LessonListResponse,
  LessonResponse,
  PlaceListResponse,
  PlaceResponse,
  RabbiListResponse,
  RabbiResponse,
  UpdateLessonRequest,
  UpdatePlaceRequest,
  UpdateRabbiRequest,
} from '@torabarabim/common';

import type { AdminLessonFilters, AdminPlaceFilters, AdminRabbiFilters } from './models';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

// Carries the HTTP status and, when the server sent one, its `error` code
// (e.g. 'unknown_rabbi'), so a caller can react to a specific failure
// without parsing `message` (client/CLAUDE.md, Data and State). Status 0
// marks a request that never reached the server.
export class AdminApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string | undefined,
    message: string,
  ) {
    super(message);
    this.name = 'AdminApiError';
  }
}

const parseErrorBody = async (response: Response): Promise<{ code?: string }> => {
  try {
    const body: unknown = await response.json();
    const code = body && typeof body === 'object' && 'error' in body && typeof body.error === 'string' ? body.error : undefined;
    return { code };
  } catch {
    return {};
  }
};

// Every admin call rides the httpOnly session cookie, which is only sent
// with `credentials: 'include'` since the client and server run on
// different ports in dev.
const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
  let response: Response;
  try {
    response = await fetch(url, { ...init, credentials: 'include' });
  } catch (error) {
    throw new AdminApiError(0, undefined, `failed to reach ${url}: ${String(error)}`);
  }

  if (!response.ok) {
    const { code } = await parseErrorBody(response);
    throw new AdminApiError(response.status, code, `${init?.method ?? 'GET'} ${url} returned ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
};

const url = (path: string): URL => new URL(path, window.location.origin);

// POST /v1/admin/login
// 200 with AdminUser on success, sets the session cookie.
// 401 on bad credentials. 429 when rate limited.
export const login = (body: { email: string; password: string }): Promise<AdminUser> =>
  request(url('/v1/admin/login').toString(), { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(body) });

// POST /v1/admin/logout
// 204 always, clears the session cookie.
export const logout = (): Promise<void> => request(url('/v1/admin/logout').toString(), { method: 'POST' });

// GET /v1/admin/me
// 200 with AdminUser when a valid session cookie is present, 401 otherwise.
export const fetchSession = (): Promise<AdminUser> => request(url('/v1/admin/me').toString());

// GET /v1/admin/rabbis
// 200 with RabbiListResponse, including an empty items array.
export const fetchAdminRabbis = (filters: AdminRabbiFilters): Promise<RabbiListResponse> => {
  const target = url('/v1/admin/rabbis');
  if (filters.q) target.searchParams.set('q', filters.q);
  target.searchParams.set('page', String(filters.page ?? 1));
  target.searchParams.set('pageSize', String(filters.pageSize ?? 50));
  return request(target.toString());
};

// GET /v1/admin/rabbis/:id
// 200 with RabbiResponse. 404 if the rabbi does not exist.
export const fetchAdminRabbi = (id: string): Promise<RabbiResponse> => request(url(`/v1/admin/rabbis/${id}`).toString());

// GET /v1/admin/rabbis/:id/delete-preview
// 200 with DeleteImpactPreview. 404 if the rabbi does not exist.
export const fetchAdminRabbiDeletePreview = (id: string): Promise<DeleteImpactPreview> =>
  request(url(`/v1/admin/rabbis/${id}/delete-preview`).toString());

// POST /v1/admin/rabbis
// 201 with RabbiResponse. 400 on invalid input.
export const createAdminRabbi = (body: CreateRabbiRequest): Promise<RabbiResponse> =>
  request(url('/v1/admin/rabbis').toString(), { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(body) });

// PATCH /v1/admin/rabbis/:id
// 200 with RabbiResponse. 400 on invalid input. 404 if the rabbi does not exist.
export const updateAdminRabbi = (id: string, body: UpdateRabbiRequest): Promise<RabbiResponse> =>
  request(url(`/v1/admin/rabbis/${id}`).toString(), { method: 'PATCH', headers: JSON_HEADERS, body: JSON.stringify(body) });

// DELETE /v1/admin/rabbis/:id
// 204 on success. 404 if the rabbi does not exist. 409 if the cascading
// delete was not confirmed (send `confirm: true` after the preview).
export const deleteAdminRabbi = (id: string, confirm: boolean): Promise<void> => {
  const target = url(`/v1/admin/rabbis/${id}`);
  if (confirm) target.searchParams.set('confirm', 'true');
  return request(target.toString(), { method: 'DELETE' });
};

// POST /v1/admin/rabbis/:id/photo (multipart)
// 200 with RabbiResponse. 400 no file or unsupported type. 413 too large.
// 415 wrong content type.
export const uploadAdminRabbiPhoto = (id: string, file: File): Promise<RabbiResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  return request(url(`/v1/admin/rabbis/${id}/photo`).toString(), { method: 'POST', body: formData });
};

// GET /v1/admin/lessons
// 200 with LessonListResponse, including an empty items array.
export const fetchAdminLessons = (filters: AdminLessonFilters): Promise<LessonListResponse> => {
  const target = url('/v1/admin/lessons');
  if (filters.cityId) target.searchParams.set('cityId', filters.cityId);
  if (filters.rabbiId) target.searchParams.set('rabbiId', filters.rabbiId);
  if (filters.placeId) target.searchParams.set('placeId', filters.placeId);
  target.searchParams.set('page', String(filters.page ?? 1));
  target.searchParams.set('pageSize', String(filters.pageSize ?? 50));
  return request(target.toString());
};

// GET /v1/admin/lessons/:id
// 200 with LessonResponse. 404 if the lesson does not exist.
export const fetchAdminLesson = (id: string): Promise<LessonResponse> => request(url(`/v1/admin/lessons/${id}`).toString());

// POST /v1/admin/lessons
// 201 with LessonResponse. 400 invalid_request / unknown_rabbi / unknown_place.
export const createAdminLesson = (body: CreateLessonRequest): Promise<LessonResponse> =>
  request(url('/v1/admin/lessons').toString(), { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(body) });

// PATCH /v1/admin/lessons/:id
// 200 with LessonResponse. 400 invalid_request / unknown_rabbi / unknown_place.
// 404 if the lesson does not exist.
export const updateAdminLesson = (id: string, body: UpdateLessonRequest): Promise<LessonResponse> =>
  request(url(`/v1/admin/lessons/${id}`).toString(), { method: 'PATCH', headers: JSON_HEADERS, body: JSON.stringify(body) });

// GET /v1/admin/places
// 200 with PlaceListResponse, including an empty items array. Used to join
// a lesson's place onto its row for display, never to build a places
// management screen (out of scope for this slice).
export const fetchAdminPlaces = (filters: AdminPlaceFilters): Promise<PlaceListResponse> => {
  const target = url('/v1/admin/places');
  if (filters.q) target.searchParams.set('q', filters.q);
  if (filters.cityId) target.searchParams.set('cityId', filters.cityId);
  target.searchParams.set('page', String(filters.page ?? 1));
  target.searchParams.set('pageSize', String(filters.pageSize ?? 50));
  return request(target.toString());
};

// GET /v1/admin/places/:id
// 200 with PlaceResponse. 404 if the place does not exist.
export const fetchAdminPlace = (id: string): Promise<PlaceResponse> => request(url(`/v1/admin/places/${id}`).toString());

// POST /v1/admin/places
// 201 with PlaceResponse. 400 invalid_request / unknown_city.
export const createAdminPlace = (body: CreatePlaceRequest): Promise<PlaceResponse> =>
  request(url('/v1/admin/places').toString(), { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(body) });

// PATCH /v1/admin/places/:id
// 200 with PlaceResponse. 400 invalid_request / unknown_city. 404 if the place does not exist.
export const updateAdminPlace = (id: string, body: UpdatePlaceRequest): Promise<PlaceResponse> =>
  request(url(`/v1/admin/places/${id}`).toString(), { method: 'PATCH', headers: JSON_HEADERS, body: JSON.stringify(body) });

// GET /v1/cities (the public endpoint, not admin-guarded)
// 200, including an empty result set.
// A deliberate small duplicate of `HomePage/api.ts`'s `fetchCities`: the
// two features are siblings, not ancestor/descendant, so importing across
// them would break the folder-ownership tree (client/CLAUDE.md, Component
// Tree). Lift both into a shared module if a third caller appears.
export const fetchAdminCities = (q: string): Promise<{ items: City[] }> => {
  const target = url('/v1/cities');
  target.searchParams.set('q', q);
  return request(target.toString());
};
