import type { RabbiProminence } from './home';
import type { LessonException } from './lesson-exception';
import type { Lesson, ResolvedLessonPlace } from './lesson';
import type { Rabbi } from './rabbi';

// Never carries passwordHash: that stays server-side.
export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

// `prominence` is an admin-only field: it drives home-row sort order and
// must never appear on the public `Rabbi` type or any public response.
export type CreateRabbiRequest = Omit<Rabbi, 'id'> & { prominence?: RabbiProminence };
// An update is a partial patch, so omitting a key must mean something
// different from clearing it: omit `title` or `bio` to leave it as is,
// send `null` to clear it, send a string to set it. `name` and
// `prominence` are never nullable, so they only ever take "omit or set".
export type UpdateRabbiRequest = Partial<Omit<CreateRabbiRequest, 'title' | 'bio'>> & {
  title?: string | null;
  bio?: string | null;
};
export type RabbiResponse = Rabbi & { prominence: RabbiProminence };

export type CreateLessonRequest = Omit<Lesson, 'id'>;
// A partial update could mix a 'weekly' recurrenceKind with a leftover
// 'once' date field, a state the Lesson type is built to reject. Updates
// are a full replacement instead of a merge to keep that guarantee.
export type UpdateLessonRequest = CreateLessonRequest;
// A write sends `place.cityCode` only; a read gets `place.cityName` back
// too, resolved server-side, so the admin client never has to hold or
// look up city reference data of its own just to show a lesson's city.
export type LessonResponse = Omit<Lesson, 'place'> & { place: ResolvedLessonPlace };

// Plain `Omit` does not distribute over a union: it computes `keyof` of
// the whole union, which is the *intersection* of the branches' keys, and
// collapses `LessonException` down to just `{ kind; date }`, silently
// dropping `reason`, `startTime`, `place`, `substituteRabbiId` and `note`.
// `T extends unknown ? Omit<T, K> : never` forces the compiler to apply
// `Omit` to each branch separately before it re-unions the results, so
// each branch keeps its own fields and an illegal combination (e.g.
// `kind: 'cancelled'` carrying a `place`) stays unrepresentable.
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

export type CreateLessonExceptionRequest = DistributiveOmit<LessonException, 'lessonId'>;
export type UpdateLessonExceptionRequest = CreateLessonExceptionRequest;
// Mirrors `LessonResponse`: a 'modified' exception's `place` override, if
// present, comes back with its city name resolved too. Carries `id` (absent
// from `LessonException`) so the admin client has something to address a
// single exception with for PATCH/DELETE.
type ResolvedLessonException =
  | Extract<LessonException, { kind: 'cancelled' }>
  | (Omit<Extract<LessonException, { kind: 'modified' }>, 'place'> & { place?: ResolvedLessonPlace });
export type LessonExceptionResponse = ResolvedLessonException & { id: number };

// What deleting a rabbi would destroy: shown to the admin before they
// confirm, and again on a 409 if they did not confirm.
export interface DeleteImpactPreview {
  lessonCount: number;
  exceptionCount: number;
}

export interface RabbiListResponse {
  items: RabbiResponse[];
  page: number;
  pageSize: number;
  total: number;
}

export interface LessonListResponse {
  items: LessonResponse[];
  page: number;
  pageSize: number;
  total: number;
}

export interface LessonExceptionListResponse {
  items: LessonExceptionResponse[];
}

// An administrator's view of a rabbi's login account. Never carries
// `passwordHash`, and a temporary password is only ever returned once, by
// the create and reset-password endpoints, never by a read.
export interface RabbiAccountResponse {
  id: string;
  email: string;
  username?: string;
  rabbiId: string;
  isActive: boolean;
}

export type CreateRabbiAccountRequest = {
  email: string;
  username: string;
};

export type RabbiAccountCreatedResponse = RabbiAccountResponse & {
  temporaryPassword: string;
};

export interface ResetRabbiPasswordResponse {
  temporaryPassword: string;
}

export type UpdateRabbiAccountRequest = {
  isActive: boolean;
};

// An administrator's view of another admin account. Never carries
// `passwordHash`.
export interface AdminUserListItem {
  id: string;
  name: string;
  email: string;
  username?: string;
  isActive: boolean;
}

export interface AdminUserListResponse {
  items: AdminUserListItem[];
  page: number;
  pageSize: number;
  total: number;
}

// The creating admin chooses the new admin's password directly, unlike a
// rabbi account where the server generates a one-time temporary one.
export type CreateAdminUserRequest = {
  name: string;
  email: string;
  username: string;
  password: string;
};

export type UpdateAdminUserRequest = {
  isActive: boolean;
};
