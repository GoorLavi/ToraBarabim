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

// Bounds how long the loading skeleton can hold: with the default backoff
// this settles into `isError` within a couple of seconds of a failed
// request, instead of retrying under TanStack Query's much longer default
// schedule (design review, item 2).
export const HOME_DATA_RETRY_LIMIT = 1;

export const HOME_QUERY_KEYS = {
  lessons: (filters: LessonFilters) => ['lessons', 'search', filters] as const,
  cities: (q: string) => ['cities', 'search', q] as const,
  homeRows: () => ['home'] as const,
};

// Rail mode's context line (helpers.ts, contextLine): the honest first-load
// state, no city or date assumed (design-system.md, "No default city").
export const RAIL_CONTEXT_LINE = 'שיעורים בכל הארץ בשבועיים הקרובים';

// Mirrors the real `LessonCard` body block's rough height (title, meta and
// city lines plus padding), so a loading skeleton's card does not jump in
// block-size once real data replaces it. Shared by LessonCardSkeleton, the
// one skeleton card both HomeRails/components/RailSkeleton and
// LessonsSection/components/DayLessonsSkeleton render, which is why it
// lives here rather than under either one.
export const SKELETON_BODY_HEIGHT = '104px';

// The poster's width-to-height ratio, as a plain number so CSS `aspect-ratio`
// can read it directly. The one place this ratio is written: LessonCard,
// LessonCardSkeleton and LessonRail's arrow-centring calc all read it from
// here, so a future change to the ratio cannot leave one of them stale
// (design review, item: "the poster aspect ratio is written in three
// places"). Stays 3:4, not the 2:3 the design doc states elsewhere; the
// human chose the shipped code over the doc, and the doc is being corrected
// separately.
export const POSTER_ASPECT_RATIO = 3 / 4;
