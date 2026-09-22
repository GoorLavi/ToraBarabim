import type {
  AudienceScope,
  PlaceCreateLessonRequest,
  PlaceLessonListResponse,
  PlaceLessonResponse,
  PlaceProfileResponse,
  PlaceUpdateLessonRequest,
  RabbiDetailResponse,
  RabbiDirectoryResponse,
  UpdatePlaceProfileRequest,
} from '@torabarabim/common';

import type { PlaceLessonListFilters } from './models';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

// Carries the HTTP status and, when the server sent one, its `error` code,
// mirroring `RabbiPanel/api.ts`'s `RabbiApiError`. Kept as a separate class
// since the place and rabbi panels are sibling features, not a shared
// ancestor either owns. Status 0 marks a request that never reached the
// server.
export class PlaceApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string | undefined,
    message: string,
  ) {
    super(message);
    this.name = 'PlaceApiError';
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

// Every place call rides the place's own httpOnly session cookie (distinct
// from the rabbi's and the admin's, so all three panels can be open at
// once), sent only with `credentials: 'include'` since client and server
// run on different ports in dev.
const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
  let response: Response;
  try {
    response = await fetch(url, { ...init, credentials: 'include' });
  } catch (error) {
    throw new PlaceApiError(0, undefined, `failed to reach ${url}: ${String(error)}`);
  }

  if (!response.ok) {
    const { code } = await parseErrorBody(response);
    throw new PlaceApiError(response.status, code, `${init?.method ?? 'GET'} ${url} returned ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
};

const url = (path: string): URL => new URL(path, window.location.origin);

// Login is the shared `POST /v1/panel/login` (see `PanelLogin`). There is no
// `POST /v1/place/logout` or `GET /v1/place/me` yet, unlike the rabbi panel's
// pair: only the six endpoints below are live for a place account today. See
// `usePlaceSession.ts` and `components/PlaceShell/usePlaceLogout.ts` for how
// this panel copes with that gap in the meantime.

// GET /v1/place/profile
// 200 with PlaceProfileResponse. 404 if the place row behind the session is gone.
// 401 with no valid session cookie: this doubles as the session probe, see
// `usePlaceSession.ts`.
export const fetchProfile = (): Promise<PlaceProfileResponse> => request(url('/v1/place/profile').toString());

// PATCH /v1/place/profile
// 200 with PlaceProfileResponse. 400 invalid_request / unknown_city. 404 as above.
export const updateProfile = (body: UpdatePlaceProfileRequest): Promise<PlaceProfileResponse> =>
  request(url('/v1/place/profile').toString(), { method: 'PATCH', headers: JSON_HEADERS, body: JSON.stringify(body) });

// POST /v1/place/profile/photo (multipart)
// 200 with PlaceProfileResponse. 400 no file or a rejected photo (wrong type, too
// large, below the minimum size, or outside the 1.5-2.0 ratio). 413 too large. 415 wrong content type.
export const uploadProfilePhoto = (file: File): Promise<PlaceProfileResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  return request(url('/v1/place/profile/photo').toString(), { method: 'POST', body: formData });
};

// GET /v1/place/lessons
// 200 with PlaceLessonListResponse, including an empty items array.
export const fetchLessons = (filters: PlaceLessonListFilters): Promise<PlaceLessonListResponse> => {
  const target = url('/v1/place/lessons');
  target.searchParams.set('page', String(filters.page));
  target.searchParams.set('pageSize', String(filters.pageSize));
  return request(target.toString());
};

// GET /v1/place/lessons/:id
// 200 with PlaceLessonResponse. 404 if the lesson does not exist or belongs to another place.
export const fetchLesson = (id: string): Promise<PlaceLessonResponse> => request(url(`/v1/place/lessons/${id}`).toString());

// POST /v1/place/lessons
// 201 with PlaceLessonResponse. 400 invalid_request (a venue on the payload is
// rejected here too, never accepted and ignored).
export const createLesson = (body: PlaceCreateLessonRequest): Promise<PlaceLessonResponse> =>
  request(url('/v1/place/lessons').toString(), { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(body) });

// PATCH /v1/place/lessons/:id
// 200 with PlaceLessonResponse. 400 invalid_request. 404 as above.
export const updateLesson = (id: string, body: PlaceUpdateLessonRequest): Promise<PlaceLessonResponse> =>
  request(url(`/v1/place/lessons/${id}`).toString(), { method: 'PATCH', headers: JSON_HEADERS, body: JSON.stringify(body) });

// The largest page the public directory allows, mirroring the server's own
// MAX_PAGE_SIZE (server/src/service/shared/consts.ts): a hand-mirrored
// constant, since the client has no access to the server's.
const MAX_RABBI_DIRECTORY_PAGE_SIZE = 50;

// GET /v1/rabbis?page&pageSize&scope (the public directory, no place auth,
// not credentialed).
// 200 with one page of RabbiDirectoryResponse.
// There is no place-scoped rabbi search endpoint: `PlaceCreateLessonRequest`
// needs a `rabbiId`, so this panel needs some way to find one, and this is
// the only live public read of the rabbi list. Reading it at its largest
// page size per scope, rather than a real search, is a named, bounded
// workaround (see `useRabbiDirectory.ts` and the build report): a rabbi
// past the fiftieth in either scope is silently unreachable from this
// picker today.
export const fetchRabbiDirectoryPage = (scope: AudienceScope): Promise<RabbiDirectoryResponse> => {
  const target = url('/v1/rabbis');
  target.searchParams.set('page', '1');
  target.searchParams.set('pageSize', String(MAX_RABBI_DIRECTORY_PAGE_SIZE));
  target.searchParams.set('scope', scope);
  return request(target.toString());
};

// GET /v1/rabbis/:rabbiId (the public detail read, no place auth).
// 200 with RabbiDetailResponse. 404 when the rabbi no longer exists.
// Used to resolve an existing lesson's own `rabbiId` back to a name when
// editing, independent of `fetchRabbiDirectoryPage`'s fiftieth-rabbi cap:
// this always finds the one rabbi it asks for, by id.
export const fetchRabbiById = (rabbiId: string): Promise<RabbiDetailResponse> => request(url(`/v1/rabbis/${encodeURIComponent(rabbiId)}`).toString());
