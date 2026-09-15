import type { Area } from './area';

export interface City {
  id: string;
  name: string;
  slug: string;
  area: Area;
}

// A `GET /v1/cities` search result, with the area's Hebrew label and the
// lesson count resolved server-side so the client never has to hold its own
// Area to Hebrew mapping (see `city-directory.ts`) to render the picker's
// second line. A city with no lessons is still returned and still
// selectable; `lessonCount` is `0` rather than the row being filtered out.
export interface CitySearchResult extends City {
  areaName: string;
  lessonCount: number;
}
