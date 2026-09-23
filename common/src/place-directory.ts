import type { Place } from './venue';

// `GET /v1/places`: every active place, unfiltered and unpaged. The list is
// a small, curated set of registered venues, not a search surface.
export interface PlaceListResponse {
  items: Place[];
}

// `GET /v1/places/:id`. A deactivated place answers 404, the same as one
// that never existed: deactivation is reversible, so it is never a 410.
export type PlaceDetailResponse = Place;

// `GET /v1/places/similar`: at most 3 matches, offered while filling in a
// lesson's address. Never blocks a save and has no bearing on validation.
export interface PlaceSimilarResponse {
  items: Place[];
}
