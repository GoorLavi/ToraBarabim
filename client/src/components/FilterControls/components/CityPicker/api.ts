import type { CitySearchResult, CitySuggestionsResponse } from '@torabarabim/common';

// Carries the HTTP status so a caller can map it to Hebrew copy without
// parsing `message`, mirroring HomePage/api.ts's HomeApiError.
//
// A deliberate small duplicate of `HomePage/api.ts`'s `fetchCities` and
// `components/CitySelect/api.ts`'s own copy of the same call: this feature
// is a sibling of both, not their ancestor, so importing across them would
// break the folder-ownership tree (client/CLAUDE.md, Component Tree). Lift
// into a shared module if a fourth caller appears.
export class CityPickerApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'CityPickerApiError';
  }
}

const fetchJson = async <T>(url: URL): Promise<T> => {
  let response: Response;
  try {
    response = await fetch(url);
  } catch (error) {
    throw new CityPickerApiError(0, `failed to reach ${url.toString()}: ${String(error)}`);
  }

  if (!response.ok) {
    throw new CityPickerApiError(response.status, `GET ${url.toString()} returned ${response.status}`);
  }

  return (await response.json()) as T;
};

// GET /v1/cities
// 200 with { items: CitySearchResult[] }, including an empty result set: a
// prefix match with no hits is a normal empty list, never a 404. A city
// with zero lessons is still returned and still selectable.
// 400 for an invalid query.
// 5xx for a server or upstream failure.
export const fetchCities = (q: string): Promise<{ items: CitySearchResult[] }> => {
  const url = new URL('/v1/cities', window.location.origin);
  url.searchParams.set('q', q);
  return fetchJson(url);
};

// GET /v1/cities/suggestions, no parameters.
// 200 with CitySuggestionsResponse: areas ordered by lesson supply, cities
// within each area the same way, no cap. The panel caps the display and
// expands in place from this same payload.
// 5xx for a server or upstream failure.
export const fetchCitySuggestions = (): Promise<CitySuggestionsResponse> =>
  fetchJson(new URL('/v1/cities/suggestions', window.location.origin));
