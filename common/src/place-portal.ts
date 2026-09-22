import type { Area } from './area';
import type { LessonListResponse, LessonResponse } from './admin';
import type { Lesson } from './lesson';

// The account of a logged-in place owner. Never `passwordHash`: that stays
// entirely server-side. Mirrors `RabbiSessionUser` in `rabbi-portal.ts`,
// the same one-account-per-owner shape for the other panel role.
export interface PlaceSessionUser {
  id: string;
  email: string;
  name: string;
  placeId: string;
}

// A place's own view of itself: unlike a rabbi's profile, this carries the
// full address, because editing it changes what every lesson pointing at
// this place displays (0016 reversed: a place is an entity, not a
// per-lesson copy). Never `isActive`: that is an administrator-only
// concept, the same reason `Rabbi` never carries `prominence`.
export interface PlaceProfileResponse {
  id: string;
  slug: string;
  name: string;
  street: string;
  floor?: string;
  cityCode: number;
  cityName: string;
  area: Area;
  photoUrl?: string;
}

// A partial patch, the same three-state shape as `UpdateRabbiProfileRequest`:
// omit `floor` to leave it as is, send `null` to clear it, send a string to
// set it. `photoUrl` is never written here: it is set exclusively via the
// dedicated photo upload endpoint.
export type UpdatePlaceProfileRequest = {
  name?: string;
  street?: string;
  floor?: string | null;
  cityCode?: number;
};

// A place never sends a venue: the lesson is at that place by definition,
// so the server supplies `{ placeId, cityCode }` from the session. Unlike
// a rabbi, whose own id is implied by the session, `rabbiId` here is
// explicit: a place may name any rabbi it hosts, with no consent step (the
// owner's deliberate call).
export type PlaceCreateLessonRequest = Omit<Lesson, 'id' | 'venue'>;
export type PlaceUpdateLessonRequest = PlaceCreateLessonRequest;
export type PlaceLessonResponse = LessonResponse;
export type PlaceLessonListResponse = LessonListResponse;
