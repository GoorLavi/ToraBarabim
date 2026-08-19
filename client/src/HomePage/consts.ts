import type { LessonFilters } from './models';

export const DATE_OPTION_PARAM = 'when';
export const CUSTOM_DATE_PARAM = 'date';
export const CITY_ID_PARAM = 'cityId';
export const CITY_NAME_PARAM = 'cityName';
export const SEARCH_QUERY_PARAM = 'q';

// One request covers the target day plus enough days ahead to find a day
// with lessons, backing the ratified empty state (design-system.md, "Every
// data screen has three states"). Bounded so a city with nothing for two
// weeks gets a designed terminal empty state instead of an unbounded search.
export const LESSON_WINDOW_DAYS = 13;
export const LESSON_WINDOW_PAGE_SIZE = 50;

export const HOME_QUERY_KEYS = {
  lessons: (filters: LessonFilters) => ['lessons', 'search', filters] as const,
  cities: (q: string) => ['cities', 'search', q] as const,
};
