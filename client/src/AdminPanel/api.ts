import type {
  AdminDedication,
  AdminOccurrenceListResponse,
  AdminUser,
  AdminUserListItem,
  AdminUserListResponse,
  CreateAdminUserRequest,
  CreateDedicationRequest,
  CreateLessonExceptionRequest,
  CreateLessonRequest,
  CreateRabbiAccountRequest,
  CreateRabbiRequest,
  DedicationListResponse,
  DedicationPreviewRequest,
  DedicationPreviewResponse,
  DeleteImpactPreview,
  LessonExceptionListResponse,
  LessonExceptionResponse,
  LessonListResponse,
  LessonResponse,
  RabbiAccountCreatedResponse,
  RabbiAccountResponse,
  RabbiListResponse,
  RabbiResponse,
  ResetRabbiPasswordResponse,
  TakedownDedicationRequest,
  UpdateAdminUserRequest,
  UpdateDedicationRequest,
  UpdateLessonExceptionRequest,
  UpdateLessonRequest,
  UpdateRabbiAccountRequest,
  UpdateRabbiRequest,
} from '@torabarabim/common';

import type { AdminDedicationFilters, AdminLessonFilters, AdminRabbiFilters, AdminUserFilters } from './models';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

// Mirrors a Zod `flatten()` result (server/CLAUDE.md, Validation and
// Errors): `formErrors` for issues with no single field, `fieldErrors` keyed
// by the request body's own field names. Carried on `AdminApiError` so a
// form can render each issue beside its field instead of one banner.
export interface AdminValidationDetails {
  formErrors: string[];
  fieldErrors: Record<string, string[]>;
}

const isValidationDetails = (value: unknown): value is AdminValidationDetails =>
  Boolean(value) && typeof value === 'object' && value !== null && 'fieldErrors' in value;

// Carries the HTTP status and, when the server sent one, its `error` code
// (e.g. 'unknown_rabbi'), so a caller can react to a specific failure
// without parsing `message` (client/CLAUDE.md, Data and State). Status 0
// marks a request that never reached the server. `details` is only ever
// present on a 400 `invalid_request` (see `AdminValidationDetails` above).
export class AdminApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string | undefined,
    message: string,
    public readonly details: AdminValidationDetails | undefined = undefined,
  ) {
    super(message);
    this.name = 'AdminApiError';
  }
}

const parseErrorBody = async (response: Response): Promise<{ code?: string; details?: AdminValidationDetails }> => {
  try {
    const body: unknown = await response.json();
    if (!body || typeof body !== 'object') return {};
    const code = 'error' in body && typeof body.error === 'string' ? body.error : undefined;
    const details = 'details' in body && isValidationDetails(body.details) ? body.details : undefined;
    return { code, details };
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
    const { code, details } = await parseErrorBody(response);
    throw new AdminApiError(response.status, code, `${init?.method ?? 'GET'} ${url} returned ${response.status}`, details);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
};

const url = (path: string): URL => new URL(path, window.location.origin);

// POST /v1/admin/login
// 200 with AdminUser on success, sets the session cookie. `identifier` is
// either the account's email or its username.
// 401 on bad credentials. 429 when rate limited.
export const login = (body: { identifier: string; password: string }): Promise<AdminUser> =>
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

// GET /v1/admin/rabbis/:id/account
// 200 with RabbiAccountResponse. 404 'not_found' if the rabbi does not
// exist, 404 'account_not_found' if the rabbi has no account yet (a normal
// state, not an error to surface).
export const fetchRabbiAccount = (rabbiId: string): Promise<RabbiAccountResponse> =>
  request(url(`/v1/admin/rabbis/${rabbiId}/account`).toString());

// POST /v1/admin/rabbis/:id/account
// 201 with RabbiAccountCreatedResponse, whose `temporaryPassword` is
// returned only this once. 404 if the rabbi does not exist. 409
// 'account_already_exists'. 400 on invalid input.
export const createRabbiAccount = (rabbiId: string, body: CreateRabbiAccountRequest): Promise<RabbiAccountCreatedResponse> =>
  request(url(`/v1/admin/rabbis/${rabbiId}/account`).toString(), { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(body) });

// PATCH /v1/admin/rabbis/:id/account
// 200 with RabbiAccountResponse. 404 if the rabbi or its account does not
// exist.
export const updateRabbiAccount = (rabbiId: string, body: UpdateRabbiAccountRequest): Promise<RabbiAccountResponse> =>
  request(url(`/v1/admin/rabbis/${rabbiId}/account`).toString(), { method: 'PATCH', headers: JSON_HEADERS, body: JSON.stringify(body) });

// POST /v1/admin/rabbis/:id/account/reset-password
// 200 with ResetRabbiPasswordResponse, whose `temporaryPassword` is
// returned only this once. 404 if the rabbi or its account does not exist.
export const resetRabbiPassword = (rabbiId: string): Promise<ResetRabbiPasswordResponse> =>
  request(url(`/v1/admin/rabbis/${rabbiId}/account/reset-password`).toString(), { method: 'POST' });

// GET /v1/admin/lessons
// 200 with LessonListResponse, including an empty items array.
export const fetchAdminLessons = (filters: AdminLessonFilters): Promise<LessonListResponse> => {
  const target = url('/v1/admin/lessons');
  if (filters.cityId) target.searchParams.set('cityId', filters.cityId);
  if (filters.rabbiId) target.searchParams.set('rabbiId', filters.rabbiId);
  target.searchParams.set('page', String(filters.page ?? 1));
  target.searchParams.set('pageSize', String(filters.pageSize ?? 50));
  return request(target.toString());
};

// GET /v1/admin/lessons/:id
// 200 with LessonResponse. 404 if the lesson does not exist.
export const fetchAdminLesson = (id: string): Promise<LessonResponse> => request(url(`/v1/admin/lessons/${id}`).toString());

// POST /v1/admin/lessons
// 201 with LessonResponse. 400 invalid_request / unknown_rabbi / unknown_city.
export const createAdminLesson = (body: CreateLessonRequest): Promise<LessonResponse> =>
  request(url('/v1/admin/lessons').toString(), { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(body) });

// PATCH /v1/admin/lessons/:id
// 200 with LessonResponse. 400 invalid_request / unknown_rabbi / unknown_city.
// 404 if the lesson does not exist.
export const updateAdminLesson = (id: string, body: UpdateLessonRequest): Promise<LessonResponse> =>
  request(url(`/v1/admin/lessons/${id}`).toString(), { method: 'PATCH', headers: JSON_HEADERS, body: JSON.stringify(body) });

// GET /v1/admin/lessons/:lessonId/occurrences
// 200 with AdminOccurrenceListResponse: this lesson's own recurrence
// expanded over a 14-day window counting today, exceptions already
// applied, including an empty items array. 404 if the lesson does not exist.
export const fetchAdminOccurrences = (lessonId: string): Promise<AdminOccurrenceListResponse> =>
  request(url(`/v1/admin/lessons/${lessonId}/occurrences`).toString());

// GET /v1/admin/lessons/:lessonId/exceptions
// 200 with LessonExceptionListResponse, including an empty items array.
// 404 if the lesson does not exist.
export const fetchAdminLessonExceptions = (lessonId: string): Promise<LessonExceptionListResponse> =>
  request(url(`/v1/admin/lessons/${lessonId}/exceptions`).toString());

// POST /v1/admin/lessons/:lessonId/exceptions
// 201 with LessonExceptionResponse. 400 invalid_request / date_not_in_recurrence /
// unknown_rabbi / unknown_city. 404 if the lesson does not exist. 409
// duplicate_exception if one already exists for that date.
export const createAdminLessonException = (lessonId: string, body: CreateLessonExceptionRequest): Promise<LessonExceptionResponse> =>
  request(url(`/v1/admin/lessons/${lessonId}/exceptions`).toString(), { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(body) });

// PATCH /v1/admin/lessons/:lessonId/exceptions/:exceptionId
// 200 with LessonExceptionResponse. Same 400s as create. 404 if the lesson or exception does not exist.
export const updateAdminLessonException = (
  lessonId: string,
  exceptionId: number,
  body: UpdateLessonExceptionRequest,
): Promise<LessonExceptionResponse> =>
  request(url(`/v1/admin/lessons/${lessonId}/exceptions/${exceptionId}`).toString(), {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });

// DELETE /v1/admin/lessons/:lessonId/exceptions/:exceptionId
// 204 on success. 404 if the lesson or exception does not exist.
export const deleteAdminLessonException = (lessonId: string, exceptionId: number): Promise<void> =>
  request(url(`/v1/admin/lessons/${lessonId}/exceptions/${exceptionId}`).toString(), { method: 'DELETE' });

// GET /v1/admin/admin-users
// 200 with AdminUserListResponse, including an empty items array.
// 403 super_admin_required.
export const fetchAdminUsers = (filters: AdminUserFilters): Promise<AdminUserListResponse> => {
  const target = url('/v1/admin/admin-users');
  target.searchParams.set('page', String(filters.page ?? 1));
  target.searchParams.set('pageSize', String(filters.pageSize ?? 50));
  return request(target.toString());
};

// POST /v1/admin/admin-users
// 201 with AdminUserListItem. 400 invalid_request / weak_password.
// 409 duplicate_email / duplicate_username. 403 super_admin_required.
export const createAdminUser = (body: CreateAdminUserRequest): Promise<AdminUserListItem> =>
  request(url('/v1/admin/admin-users').toString(), { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(body) });

// PATCH /v1/admin/admin-users/:id
// 200 with AdminUserListItem. 404 if the admin user does not exist.
// 409 cannot_deactivate_self / cannot_modify_super_admin. 403 super_admin_required.
export const setAdminUserActive = (id: string, body: UpdateAdminUserRequest): Promise<AdminUserListItem> =>
  request(url(`/v1/admin/admin-users/${id}`).toString(), { method: 'PATCH', headers: JSON_HEADERS, body: JSON.stringify(body) });

// DELETE /v1/admin/admin-users/:id
// 204 on success. 404 not_found. 409 admin_user_still_active (must
// deactivate before deleting). 409 cannot_modify_super_admin. 403
// super_admin_required.
export const deleteAdminUser = (id: string): Promise<void> => request(url(`/v1/admin/admin-users/${id}`).toString(), { method: 'DELETE' });

// PATCH /v1/admin/admin-users/:id/password
// 200 with AdminUserListItem. 400 weak_password. 404 not_found. 403 super_admin_required.
export const setAdminUserPassword = (id: string, password: string): Promise<AdminUserListItem> =>
  request(url(`/v1/admin/admin-users/${id}/password`).toString(), {
    method: 'PATCH',
    headers: JSON_HEADERS,
    body: JSON.stringify({ password }),
  });

// GET /v1/admin/dedications
// 200 with DedicationListResponse, including an empty items array.
export const fetchAdminDedications = (filters: AdminDedicationFilters): Promise<DedicationListResponse> => {
  const target = url('/v1/admin/dedications');
  target.searchParams.set('page', String(filters.page ?? 1));
  target.searchParams.set('pageSize', String(filters.pageSize ?? 50));
  return request(target.toString());
};

// GET /v1/admin/dedications/:id
// 200 with AdminDedication. 404 not_found if the dedication does not exist.
export const fetchAdminDedication = (id: string): Promise<AdminDedication> => request(url(`/v1/admin/dedications/${id}`).toString());

// POST /v1/admin/dedications
// 201 with AdminDedication. 400 invalid_request, flattened issues in `details`.
export const createAdminDedication = (body: CreateDedicationRequest): Promise<AdminDedication> =>
  request(url('/v1/admin/dedications').toString(), { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(body) });

// PATCH /v1/admin/dedications/:id
// 200 with AdminDedication. 400 invalid_request, flattened issues in `details`.
// 404 not_found if the dedication does not exist. A full replacement, not a
// merge: send every field (common/src/admin.ts, `UpdateDedicationRequest`).
export const updateAdminDedication = (id: string, body: UpdateDedicationRequest): Promise<AdminDedication> =>
  request(url(`/v1/admin/dedications/${id}`).toString(), { method: 'PATCH', headers: JSON_HEADERS, body: JSON.stringify(body) });

// POST /v1/admin/dedications/:id/takedown
// 200 with AdminDedication. 400 invalid_request if `reason` is missing or
// blank. 404 not_found if the dedication does not exist.
export const takedownAdminDedication = (id: string, body: TakedownDedicationRequest): Promise<AdminDedication> =>
  request(url(`/v1/admin/dedications/${id}/takedown`).toString(), { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(body) });

// POST /v1/admin/dedications/preview
// 200 with DedicationPreviewResponse. Only `type` is required; an
// incomplete draft is a normal 200, never a 400. A deceased person's name
// must never enter a URL or an access log, so this is a POST rather than a
// GET with query parameters (server/src/api/admin/dedications/index.ts).
export const previewAdminDedication = (body: DedicationPreviewRequest): Promise<DedicationPreviewResponse> =>
  request(url('/v1/admin/dedications/preview').toString(), { method: 'POST', headers: JSON_HEADERS, body: JSON.stringify(body) });
