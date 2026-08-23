import type {
  RabbiCreateLessonExceptionRequest,
  RabbiCreateLessonRequest,
  RabbiLessonExceptionListResponse,
  RabbiLessonExceptionResponse,
  RabbiLessonListResponse,
  RabbiLessonResponse,
  RabbiOccurrenceListResponse,
  RabbiProfileResponse,
  RabbiSessionUser,
  RabbiUpdateLessonExceptionRequest,
  RabbiUpdateLessonRequest,
  UpdateRabbiProfileRequest,
} from '@torabarabim/common';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

// Carries the HTTP status and, when the server sent one, its `error` code,
// so a caller can react to a specific failure without parsing `message`
// (client/CLAUDE.md, Data and State). Status 0 marks a request that never
// reached the server. Mirrors `AdminPanel/api.ts`'s `AdminApiError`: kept
// as a separate class since the rabbi and admin panels are sibling
// features, not a shared ancestor either owns.
export class RabbiApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string | undefined,
    message: string,
  ) {
    super(message);
    this.name = 'RabbiApiError';
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

// Every rabbi call rides the rabbi's own httpOnly session cookie (distinct
// from the admin's, so both panels can be open at once), sent only with
// `credentials: 'include'` since client and server run on different ports
// in dev.
const request = async <T>(url: string, init?: RequestInit): Promise<T> => {
  let response: Response;
  try {
    response = await fetch(url, { ...init, credentials: 'include' });
  } catch (error) {
    throw new RabbiApiError(0, undefined, `failed to reach ${url}: ${String(error)}`);
  }

  if (!response.ok) {
    const { code } = await parseErrorBody(response);
    throw new RabbiApiError(response.status, code, `${init?.method ?? 'GET'} ${url} returned ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
};

const url = (path: string): URL => new URL(path, window.location.origin);

// POST /v1/rabbi/login
// 200 with RabbiSessionUser on success, sets the session cookie.
// 401 on bad credentials. 429 when rate limited.
export const login = (body: { email: string; password: string }): Promise<RabbiSessionUser> =>
  request(url('/v1/rabbi/login').toString(), { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(body) });

// POST /v1/rabbi/logout
// 204 always, clears the session cookie.
export const logout = (): Promise<void> => request(url('/v1/rabbi/logout').toString(), { method: 'POST' });

// GET /v1/rabbi/me
// 200 with RabbiSessionUser when a valid session cookie is present, 401 otherwise.
export const fetchSession = (): Promise<RabbiSessionUser> => request(url('/v1/rabbi/me').toString());

// GET /v1/rabbi/profile
// 200 with RabbiProfileResponse. 404 if the rabbi row behind the session is gone.
export const fetchProfile = (): Promise<RabbiProfileResponse> => request(url('/v1/rabbi/profile').toString());

// PATCH /v1/rabbi/profile
// 200 with RabbiProfileResponse. 400 on invalid input. 404 as above.
export const updateProfile = (body: UpdateRabbiProfileRequest): Promise<RabbiProfileResponse> =>
  request(url('/v1/rabbi/profile').toString(), { method: 'PATCH', headers: JSON_HEADERS, body: JSON.stringify(body) });

// POST /v1/rabbi/profile/photo (multipart)
// 200 with RabbiProfileResponse. 400 no file. 413 too large. 415 wrong content type.
export const uploadProfilePhoto = (file: File): Promise<RabbiProfileResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  return request(url('/v1/rabbi/profile/photo').toString(), { method: 'POST', body: formData });
};

// GET /v1/rabbi/lessons
// 200 with RabbiLessonListResponse, including an empty items array. Not
// paginated: a rabbi has a handful of lessons, never hundreds.
export const fetchLessons = (): Promise<RabbiLessonListResponse> => request(url('/v1/rabbi/lessons').toString());

// GET /v1/rabbi/lessons/:id
// 200 with RabbiLessonResponse. 404 if the lesson does not exist or belongs to another rabbi.
export const fetchLesson = (id: string): Promise<RabbiLessonResponse> => request(url(`/v1/rabbi/lessons/${id}`).toString());

// POST /v1/rabbi/lessons
// 201 with RabbiLessonResponse. 400 invalid_request / unknown_city.
export const createLesson = (body: RabbiCreateLessonRequest): Promise<RabbiLessonResponse> =>
  request(url('/v1/rabbi/lessons').toString(), { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(body) });

// PATCH /v1/rabbi/lessons/:id
// 200 with RabbiLessonResponse. 400 invalid_request / unknown_city. 404 as above.
export const updateLesson = (id: string, body: RabbiUpdateLessonRequest): Promise<RabbiLessonResponse> =>
  request(url(`/v1/rabbi/lessons/${id}`).toString(), { method: 'PATCH', headers: JSON_HEADERS, body: JSON.stringify(body) });

// DELETE /v1/rabbi/lessons/:id
// 204 on success. 404 as above. Cascades to the lesson's own exceptions
// server-side: see the report for this slice on the deliberate hard delete.
export const deleteLesson = (id: string): Promise<void> => request(url(`/v1/rabbi/lessons/${id}`).toString(), { method: 'DELETE' });

// GET /v1/rabbi/occurrences
// 200 with RabbiOccurrenceListResponse: the next `UPCOMING_OCCURRENCE_WINDOW_DAYS`
// (server-side, 14) days, exceptions already applied, no query parameters.
export const fetchOccurrences = (): Promise<RabbiOccurrenceListResponse> => request(url('/v1/rabbi/occurrences').toString());

// GET /v1/rabbi/lessons/:lessonId/exceptions
// 200 with RabbiLessonExceptionListResponse. 404 if the lesson does not exist or belongs to another rabbi.
export const fetchLessonExceptions = (lessonId: string): Promise<RabbiLessonExceptionListResponse> =>
  request(url(`/v1/rabbi/lessons/${lessonId}/exceptions`).toString());

// POST /v1/rabbi/lessons/:lessonId/exceptions
// 201 with RabbiLessonExceptionResponse. 400 invalid_request / date_not_in_recurrence / unknown_city.
// 404 if the lesson does not exist. 409 duplicate_exception if one already exists for that date.
export const createLessonException = (lessonId: string, body: RabbiCreateLessonExceptionRequest): Promise<RabbiLessonExceptionResponse> =>
  request(url(`/v1/rabbi/lessons/${lessonId}/exceptions`).toString(), { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(body) });

// PATCH /v1/rabbi/lessons/:lessonId/exceptions/:exceptionId
// 200 with RabbiLessonExceptionResponse. Same 400s as create. 404 if the lesson or exception does not exist.
export const updateLessonException = (
  lessonId: string,
  exceptionId: number,
  body: RabbiUpdateLessonExceptionRequest,
): Promise<RabbiLessonExceptionResponse> =>
  request(url(`/v1/rabbi/lessons/${lessonId}/exceptions/${exceptionId}`).toString(), {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });

// DELETE /v1/rabbi/lessons/:lessonId/exceptions/:exceptionId
// 204 on success. 404 if the lesson or exception does not exist.
export const deleteLessonException = (lessonId: string, exceptionId: number): Promise<void> =>
  request(url(`/v1/rabbi/lessons/${lessonId}/exceptions/${exceptionId}`).toString(), { method: 'DELETE' });
