import type { PlaceListResponse, PlaceSimilarResponse } from '@torabarabim/common';

// Carries the HTTP status so a caller can map it to Hebrew copy without
// parsing `message`. A deliberate small duplicate of `PlacesPage/api.ts`'s
// own `PlacesPageApiError` and `components/FilterControls/components/CityPicker/api.ts`'s
// `CityPickerApiError`: this feature is a sibling of both, not their
// ancestor, so importing across them would break the folder-ownership tree
// (client/CLAUDE.md, Component Tree). Lift into a shared module if a fourth
// caller appears.
export class PlacePickerApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'PlacePickerApiError';
  }
}

const fetchJson = async <T>(url: URL): Promise<T> => {
  let response: Response;
  try {
    response = await fetch(url);
  } catch (error) {
    throw new PlacePickerApiError(0, `failed to reach ${url.toString()}: ${String(error)}`);
  }

  if (!response.ok) {
    throw new PlacePickerApiError(response.status, `GET ${url.toString()} returned ${response.status}`);
  }

  return (await response.json()) as T;
};

// GET /v1/places
// 200 with PlaceListResponse: every active place, unfiltered and unpaged,
// including an empty result set. Public, no auth. Matching happens
// client-side in `usePlaceSearch`, since the list is small and curated and
// the endpoint itself takes no search parameter.
export const fetchPlaces = (): Promise<PlaceListResponse> => fetchJson(new URL('/v1/places', window.location.origin));

export interface SimilarPlacesQuery {
  cityCode: number;
  name?: string;
  street?: string;
}

// GET /v1/places/similar
// 200 with PlaceSimilarResponse, including an empty result set: at most 3
// matches, never blocking a save. Public, no auth. 400 invalid_request if
// cityCode is missing or invalid, which a caller here never sends since
// this is only ever called once a city is chosen.
export const fetchSimilarPlaces = (query: SimilarPlacesQuery): Promise<PlaceSimilarResponse> => {
  const url = new URL('/v1/places/similar', window.location.origin);
  url.searchParams.set('cityCode', String(query.cityCode));
  if (query.name) url.searchParams.set('name', query.name);
  if (query.street) url.searchParams.set('street', query.street);
  return fetchJson(url);
};
