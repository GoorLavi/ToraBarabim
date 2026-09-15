import type { Area } from './area';
import type { City } from './city';
import type { Rabbi } from './rabbi';

export interface CityWithLessonCount extends City {
  lessonCount: number;
}

// One area's group in the city directory, with the area's Hebrew label and
// URL slug resolved server-side so the client never has to hold its own
// Area to Hebrew mapping or compute a slug itself.
export interface CityAreaGroup {
  area: Area;
  areaName: string;
  slug: string;
  cities: CityWithLessonCount[];
}

// Only areas that have at least one city with a lesson appear here, and
// only cities with at least one lesson appear within them.
export interface CityDirectoryResponse {
  areas: CityAreaGroup[];
}

// One area's group in the city picker's suggestions, ordered by lesson
// supply rather than alphabetically: `CityAreaGroup` plus the area's own
// total, which is what the ordering is based on.
export interface CityAreaSuggestionGroup extends CityAreaGroup {
  areaLessonCount: number;
}

// Shown in the city picker before anyone types: areas ordered by lesson
// supply, each with its cities ordered the same way. No cap; the client
// caps the display and expands in place from this same payload.
export interface CitySuggestionsResponse {
  areas: CityAreaSuggestionGroup[];
}

// A city page, resolved by the city's slug: its area (with the area's
// Hebrew label and slug resolved server-side, same as `CityAreaGroup` for
// the label), and the distinct rabbis teaching there. `id` is the city's
// official code, the same value `GET /v1/lessons`'s `city` filter expects.
export interface CityDetailResponse extends City {
  areaName: string;
  areaSlug: string;
  rabbis: Rabbi[];
}
