import type { Area } from './area';
import type { CityWithLessonCount } from './city-directory';

// One area's row in the area directory: its Hebrew label and URL slug
// resolved server-side, and the counts across every city with a lesson in
// it.
export interface AreaSummary {
  area: Area;
  areaName: string;
  slug: string;
  cityCount: number;
  lessonCount: number;
}

// Only areas that have at least one city with a lesson appear here.
export interface AreaDirectoryResponse {
  areas: AreaSummary[];
}

// An area page, resolved by its slug: its Hebrew label and the cities in it
// that have at least one lesson. `GET /v1/lessons`'s `area` filter takes
// `area`, the enum value, not the slug.
export interface AreaDetailResponse {
  area: Area;
  areaName: string;
  slug: string;
  cities: CityWithLessonCount[];
}
