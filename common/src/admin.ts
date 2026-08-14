import type { LessonException } from './lesson-exception';
import type { Lesson } from './lesson';
import type { Place } from './place';
import type { Rabbi } from './rabbi';

// Never carries passwordHash: that stays server-side.
export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

export type CreateRabbiRequest = Omit<Rabbi, 'id'>;
export type UpdateRabbiRequest = Partial<CreateRabbiRequest>;
export type RabbiResponse = Rabbi;

export interface CreatePlaceRequest extends Omit<Place, 'id' | 'city' | 'area'> {
  cityId: string; // references City.id; server resolves city name and area from it
}
export type UpdatePlaceRequest = Partial<CreatePlaceRequest>;
export type PlaceResponse = Place;

export type CreateLessonRequest = Omit<Lesson, 'id'>;
// A partial update could mix a 'weekly' recurrenceKind with a leftover
// 'once' date field, a state the Lesson type is built to reject. Updates
// are a full replacement instead of a merge to keep that guarantee.
export type UpdateLessonRequest = CreateLessonRequest;
export type LessonResponse = Lesson;

export type CreateLessonExceptionRequest = Omit<LessonException, 'lessonId'>;
export type UpdateLessonExceptionRequest = CreateLessonExceptionRequest;
// Carries `id` (absent from `LessonException`) so the admin client has
// something to address a single exception with for PATCH/DELETE.
export type LessonExceptionResponse = LessonException & { id: number };

// What deleting a rabbi or a place would destroy: shown to the admin
// before they confirm, and again on a 409 if they did not confirm.
export interface DeleteImpactPreview {
  lessonCount: number;
  exceptionCount: number;
}

export interface RabbiListResponse {
  items: Rabbi[];
  page: number;
  pageSize: number;
  total: number;
}

export interface PlaceListResponse {
  items: Place[];
  page: number;
  pageSize: number;
  total: number;
}

export interface LessonListResponse {
  items: Lesson[];
  page: number;
  pageSize: number;
  total: number;
}

export interface LessonExceptionListResponse {
  items: LessonException[];
}
