import type { CreateLessonExceptionRequest, LessonExceptionListResponse, LessonExceptionResponse, LessonResponse } from './admin';
import type { Lesson } from './lesson';
import type { LessonOccurrence } from './lesson-occurrence';
import type { Rabbi } from './rabbi';

// The account of a logged-in rabbi. Never `prominence`, never
// `passwordHash`: both stay entirely server-side and out of this type.
export interface RabbiSessionUser {
  id: string;
  email: string;
  name: string;
  rabbiId: string;
}

// A rabbi never sends `prominence`: it is an admin-only sort input. Plain
// `Rabbi` is reused as-is for the read side of the rabbi's own profile.
export type RabbiProfileResponse = Rabbi;

// This is a partial patch, so omitting a key must mean something different
// from clearing it: omit `title` or `bio` to leave it as is, send `null`
// to clear it, send a string to set it. `name` is never nullable, so it
// only ever takes "omit or set". `photoUrl` is never written here at all:
// it is set exclusively via the dedicated photo upload endpoint.
export type UpdateRabbiProfileRequest = Partial<Pick<Rabbi, 'name'>> & {
  title?: string | null;
  bio?: string | null;
};

// A rabbi never sends `rabbiId`: it is implied by the session, never a
// value the client chooses.
export type RabbiCreateLessonRequest = Omit<Lesson, 'id' | 'rabbiId'>;
export type RabbiUpdateLessonRequest = RabbiCreateLessonRequest;
export type RabbiLessonResponse = LessonResponse;

// A rabbi has a handful of lessons, never hundreds: this list is
// deliberately unpaginated, matching `RabbiOccurrenceListResponse` below.
// `GET /v1/rabbi/lessons` takes no query parameters and returns every one
// of the signed-in rabbi's lessons in a single plain list.
export interface RabbiLessonListResponse {
  items: RabbiLessonResponse[];
}

export type RabbiCreateLessonExceptionRequest = CreateLessonExceptionRequest;
export type RabbiUpdateLessonExceptionRequest = CreateLessonExceptionRequest;
export type RabbiLessonExceptionResponse = LessonExceptionResponse;
export type RabbiLessonExceptionListResponse = LessonExceptionListResponse;

export interface RabbiOccurrenceListResponse {
  items: LessonOccurrence[];
}
