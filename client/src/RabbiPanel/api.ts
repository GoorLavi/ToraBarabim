import type {
  CourseListResponse,
  CourseResponse,
  DuplicateCourseRequest,
  PanelLoginResponse,
  RabbiCreateCourseRequest,
  RabbiCreateLessonExceptionRequest,
  RabbiCreateLessonRequest,
  RabbiLessonExceptionListResponse,
  RabbiLessonExceptionResponse,
  RabbiLessonListResponse,
  RabbiLessonResponse,
  RabbiOccurrenceListResponse,
  RabbiProfileResponse,
  RabbiSessionUser,
  RabbiUpdateCourseRequest,
  RabbiUpdateLessonExceptionRequest,
  RabbiUpdateLessonRequest,
  UpdateRabbiProfileRequest,
} from '@torabarabim/common';

import type { RabbiLessonListFilters } from './models';

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
    // Whatever the server sent under `details` for this error, unnarrowed:
    // `~/courseErrors.ts`'s `courseErrorMessage` is the one place that
    // knows each course error code's own shape.
    public readonly details: unknown = undefined,
  ) {
    super(message);
    this.name = 'RabbiApiError';
  }
}

const parseErrorBody = async (response: Response): Promise<{ code?: string; details?: unknown }> => {
  try {
    const body: unknown = await response.json();
    if (!body || typeof body !== 'object') return {};
    const code = 'error' in body && typeof body.error === 'string' ? body.error : undefined;
    const details = 'details' in body ? body.details : undefined;
    return { code, details };
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
    const { code, details } = await parseErrorBody(response);
    throw new RabbiApiError(response.status, code, `${init?.method ?? 'GET'} ${url} returned ${response.status}`, details);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
};

const url = (path: string): URL => new URL(path, window.location.origin);

// POST /v1/panel/login
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
// 200 with RabbiLessonListResponse, including an empty items array.
export const fetchLessons = (filters: RabbiLessonListFilters): Promise<RabbiLessonListResponse> => {
  const target = url('/v1/rabbi/lessons');
  target.searchParams.set('page', String(filters.page));
  target.searchParams.set('pageSize', String(filters.pageSize));
  return request(target.toString());
};

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

// GET /v1/rabbi/courses
// 200 with CourseListResponse, including an empty items array.
export const fetchCourses = (): Promise<CourseListResponse> => request(url('/v1/rabbi/courses').toString());

// GET /v1/rabbi/courses/:id
// 200 with CourseResponse. 404 if the course does not exist or belongs to another rabbi.
export const fetchCourse = (id: string): Promise<CourseResponse> => request(url(`/v1/rabbi/courses/${id}`).toString());

// POST /v1/rabbi/courses (multipart: one `course` JSON part, one `cover` file part)
// 201 with CourseResponse. 400 cover_required / invalid_request / unknown_city /
// unknown_place / course_would_be_closed / rabbanit_audience_must_be_women.
// 413 too large. 415 wrong content type.
export const createCourse = (body: RabbiCreateCourseRequest, cover: File): Promise<CourseResponse> => {
  const formData = new FormData();
  formData.append('course', JSON.stringify(body));
  formData.append('cover', cover);
  return request(url('/v1/rabbi/courses').toString(), { method: 'POST', body: formData });
};

// PATCH /v1/rabbi/courses/:id
// 200 with CourseResponse. 400 invalid_request / unknown_city / unknown_place /
// course_would_be_closed / rabbanit_audience_must_be_women. 404 as above. 409 course_closed.
export const updateCourse = (id: string, body: RabbiUpdateCourseRequest): Promise<CourseResponse> =>
  request(url(`/v1/rabbi/courses/${id}`).toString(), { method: 'PATCH', headers: JSON_HEADERS, body: JSON.stringify(body) });

// POST /v1/rabbi/courses/:id/cover (multipart, one `cover` file part)
// 200 with CourseResponse. 400/413/415 as create. 404 as above.
export const uploadCourseCover = (id: string, file: File): Promise<CourseResponse> => {
  const formData = new FormData();
  formData.append('cover', file);
  return request(url(`/v1/rabbi/courses/${id}/cover`).toString(), { method: 'POST', body: formData });
};

// POST /v1/rabbi/courses/:id/photos (multipart, one `photo` file part)
// 201 with CourseResponse. 409 course_photo_limit at 8. 404 as above.
export const uploadCoursePhoto = (id: string, file: File): Promise<CourseResponse> => {
  const formData = new FormData();
  formData.append('photo', file);
  return request(url(`/v1/rabbi/courses/${id}/photos`).toString(), { method: 'POST', body: formData });
};

// DELETE /v1/rabbi/courses/:id/photos/:photoId
// 204 on success, no body. 404 if the course or the photo does not exist.
export const deleteCoursePhoto = (id: string, photoId: string): Promise<void> =>
  request(url(`/v1/rabbi/courses/${id}/photos/${photoId}`).toString(), { method: 'DELETE' });

// POST /v1/rabbi/courses/:id/close
// 200 with CourseResponse. 409 course_closed. 404 as above.
export const closeCourse = (id: string): Promise<CourseResponse> => request(url(`/v1/rabbi/courses/${id}/close`).toString(), { method: 'POST' });

// POST /v1/rabbi/courses/:id/full
// 200 with CourseResponse. 409 course_closed. 404 as above.
export const markCourseFull = (id: string): Promise<CourseResponse> => request(url(`/v1/rabbi/courses/${id}/full`).toString(), { method: 'POST' });

// POST /v1/rabbi/courses/:id/duplicate
// 201 with the new CourseResponse. 400 invalid_request / opening_date_not_future. 404 as above. 409 course_not_closed.
export const duplicateCourse = (id: string, body: DuplicateCourseRequest): Promise<CourseResponse> =>
  request(url(`/v1/rabbi/courses/${id}/duplicate`).toString(), { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(body) });

// DELETE /v1/rabbi/courses/:id
// 204 on success. 404 as above. Cascades to the course's own photos server-side.
export const deleteCourse = (id: string): Promise<void> => request(url(`/v1/rabbi/courses/${id}`).toString(), { method: 'DELETE' });
