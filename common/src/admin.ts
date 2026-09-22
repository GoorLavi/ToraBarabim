import type { LessonProvenance } from './agent-import';
import type { DedicationHonorific, DedicationType, HonoredGender } from './dedication';
import type { RabbiProminence } from './home';
import type { LessonException } from './lesson-exception';
import type { Lesson, ResolvedLessonPlace } from './lesson';
import type { LessonOccurrence } from './lesson-occurrence';
import type { Rabbi, RabbiHonorific } from './rabbi';

// Never carries passwordHash: that stays server-side.
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  isSuper: boolean;
}

// `prominence` is an admin-only field: it orders the home page's rabbi row
// and the public rabbi directory, and must never appear on the public
// `Rabbi` type or any public response.
// `slug` is also excluded here: it is derived server-side from `name`, an
// admin never sends one, so a create or update request never carries it.
// `honorific` is optional here, unlike on the read-side `Rabbi`: the
// server defaults a create to 'rav' when omitted.
export type CreateRabbiRequest = Omit<Rabbi, 'id' | 'slug' | 'honorific'> & {
  prominence?: RabbiProminence;
  honorific?: RabbiHonorific;
};
// An update is a partial patch, so omitting a key must mean something
// different from clearing it: omit `title` or `bio` to leave it as is,
// send `null` to clear it, send a string to set it. `name` and
// `prominence` are never nullable, so they only ever take "omit or set".
// `honorific` is never here at all: it is set once at creation and never
// changes, per the honorific decision.
export type UpdateRabbiRequest = Partial<Omit<CreateRabbiRequest, 'title' | 'bio' | 'honorific'>> & {
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
// `provenance` is read-only: it is never sent on a create or update, only
// read back, so the admin form can show a notice for an imported lesson.
export type LessonResponse = Omit<Lesson, 'place'> & { place: ResolvedLessonPlace; provenance: LessonProvenance };

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

// A single lesson's own upcoming occurrences, the read model behind
// cancelling or moving one date from the admin lesson screen. Distinct
// from `RabbiOccurrenceListResponse` (`rabbi-portal.ts`): that one is a
// rabbi's cross-lesson "what's coming up for me", this one is scoped to
// one lesson id.
export interface AdminOccurrenceListResponse {
  items: LessonOccurrence[];
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
  isSuper: boolean;
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

// `upcoming`: today is before `startsOn`. `live`: today is inside
// `[startsOn, endsOn]`, `endsOn` inclusive, and the record has not been
// taken down. `ended`: today is after `endsOn` and it was never taken
// down. `takenDown` overrides every other state whatever the window says,
// since it was pulled by an admin action, not by the calendar.
export type AdminDedicationState = 'upcoming' | 'live' | 'ended' | 'takenDown';

// An administrator's full view of one dedication record, including its
// clean stored name fields. Never sent to the public home response, which
// only ever carries the composed `Dedication` (`dedication.ts`) inside a
// `DedicationGroup`.
export interface AdminDedication {
  id: string;
  type: DedicationType;
  honoredName: string;
  honorific?: DedicationHonorific;
  honoredGender: HonoredGender;
  parentName?: string;
  donorFamilyName?: string;
  closingLineEnabled: boolean;
  startsOn: string;
  endsOn: string;
  takenDownReason?: string;
  state: AdminDedicationState;
  createdAt: string;
  updatedAt: string;
}

// The admin create/edit form's live preview: the same fields the composer
// (`server/src/service/dedication/text.ts`) needs, sent unsaved so the
// admin sees exactly what a visitor will see while still typing.
export type DedicationPreviewRequest = Pick<
  AdminDedication,
  'type' | 'honoredName' | 'honorific' | 'honoredGender' | 'parentName' | 'donorFamilyName' | 'closingLineEnabled'
>;
