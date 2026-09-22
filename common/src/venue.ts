import type { Area } from './area';

// The address of a lesson or a place, with its city resolved. Both arms of
// LessonVenue carry it, so a render site that only prints an address never
// has to narrow on `kind`.
export interface ResolvedAddress {
  name: string;
  street: string;
  floor?: string;
  city: string;
  citySlug: string;
  area: Area;
}

export type LessonVenue =
  | ({ kind: 'place'; placeId: string; slug: string } & ResolvedAddress)
  | ({ kind: 'address' } & ResolvedAddress);

// A panel's (admin or rabbi) read view of a venue: the place arm is
// unchanged (its `placeId` already lets the form re-select the place), but
// the address arm carries `cityCode` (via `ResolvedLessonAddress`) instead
// of a resolved `city`/`citySlug`/`area` triple, so a loaded lesson's
// address round-trips straight into `LessonVenueInput` without the client
// reconstructing a code from the name. `LessonVenue` stays as it is for
// every public reader, which only ever prints an address and never
// resubmits one.
export type LessonVenuePanel =
  | ({ kind: 'place'; placeId: string; slug: string } & ResolvedAddress)
  | ({ kind: 'address' } & ResolvedLessonAddress);

// A lesson's free-text address: nobody needs to "recognise" a synagogue for
// this arm, and it stays available even once a place is registered, since a
// lesson names one or the other, never both. `cityCode` stays structured,
// referencing `City.id`, because the home page and the city/area filters
// depend on it.
export interface LessonAddress {
  name: string;
  street: string;
  floor?: string;
  cityCode: number;
}

// The admin's read view of an address: `LessonAddress` plus the city name
// resolved server-side, so an admin screen never has to hold or look up
// city reference data of its own just to show what it already received.
export interface ResolvedLessonAddress extends LessonAddress {
  cityName: string;
}

// What a lesson create or update names as its venue: an existing, active
// place by id, or a free-text address. A single-date exception never gets
// this choice; its own override is always a plain `LessonAddress` (see
// `LessonException`).
export type LessonVenueInput = { kind: 'place'; placeId: string } | ({ kind: 'address' } & LessonAddress);

// A registered venue, shared across every lesson held there. `isActive` is
// never on the wire: deactivating a place is reversible and never deletes
// anything, so a client never needs to branch on it. `photoUrl` is here,
// unlike on `LessonVenue`: a place's own page reads it off this record
// directly, while a search result never shows a place photo.
export interface Place {
  id: string;
  slug: string;
  name: string;
  street: string;
  floor?: string;
  city: string;
  citySlug: string;
  area: Area;
  photoUrl?: string;
}
