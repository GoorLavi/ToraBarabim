import type { Area } from '@torabarabim/common';

import type { LessonsFilters } from './models';

// The date, city, search and audience filters read `~/hooks/consts.ts`
// instead: they are shared with the home page's own filters
// (useDateFilter, useSelectedCity, useSearchQuery, useAudienceFilter), so a
// link built by one page keeps working if handed to the other. These two
// remain page-local: nothing on the home page reads them.
export const RABBI_ID_PARAM = 'rabbiId';
export const AREA_PARAM = 'area';
export const TOPIC_PARAM = 'topic';

// Reached by a link from a place's own page (PlacePage.tsx); page-local like
// the three above it.
export const PLACE_ID_PARAM = 'placeId';

// Hand-mirrored from the server's own `AREA_NAMES_HE`
// (server/src/service/shared/consts.ts), since there is no shared import
// path from a browser-executed module to server source (unlike
// routes/lesson.server.ts, which runs server-only and imports the original
// directly). Every other place on this site that needs an area's Hebrew
// name resolves it from a server response instead of holding a copy of this
// map (WomenPage/useCityAreaLookup.ts, common/src/city.ts); this is the one
// exception, made so `buildLessonsTitle` can name the `area` pass-through
// filter in its title without a second network round trip, matching how it
// already reads `rabbiId`'s and `placeId`'s names off the first fetched
// result. Flagged for review: this is a second copy of a map the rest of
// the codebase deliberately avoids duplicating.
export const LESSONS_PAGE_AREA_NAMES: Record<Area, string> = {
  north: 'הצפון',
  haifa: 'חיפה והקריות',
  sharon: 'השרון',
  center: 'המרכז',
  telAviv: 'תל אביב',
  jerusalem: 'ירושלים',
  shfela: 'השפלה',
  south: 'הדרום',
};

// The complete list's horizon: a hand-mirrored constant, since the client
// has no shared import path to the server's own limit
// (server/src/service/lesson/consts.ts, MAX_RANGE_DAYS).
export const COMPLETE_LIST_RANGE_DAYS = 90;

// This page's own page size for the complete, paginated list. Distinct
// from HomePage's LESSON_WINDOW_PAGE_SIZE, which sizes a single fixed
// window fetch rather than a page a person keeps loading more of.
export const PAGE_SIZE = 20;

// Bounds how long the loading skeleton can hold, the same reasoning as
// HomePage/consts.ts, HOME_DATA_RETRY_LIMIT.
export const LESSONS_DATA_RETRY_LIMIT = 1;

export const LESSONS_QUERY_KEYS = {
  list: (filters: LessonsFilters) => ['lessons', 'list', filters] as const,
};

export const TITLE_UNFILTERED = 'כל השיעורים';
export const ORDERED_BY_DATE_LABEL = 'לפי תאריך';

export const LOADING_MESSAGE = 'טוען שיעורים...';
export const LOAD_MORE_LABEL = 'עוד שיעורים';
export const LOADING_MORE_LABEL = 'טוען...';

export const ERROR_HEADLINE = 'לא הצלחנו לטעון את השיעורים';
export const NETWORK_ERROR_HINT = 'לא הצלחנו להתחבר לשרת, בדקו את החיבור לרשת ונסו שוב';
export const INVALID_REQUEST_HINT = 'לא הצלחנו לבצע את החיפוש, נסו לרענן את הדף';
export const SERVER_ERROR_HINT = 'נסו שוב מאוחר יותר';
export const RETRY_LABEL = 'נסו שוב';

export const CLEAR_FILTERS_LABEL = 'ניקוי הסינון';

export const SITE_EMPTY_HEADLINE = 'אין כרגע שיעורים באתר';
export const SITE_EMPTY_BODY = 'מגידי השיעור מוסיפים ומעדכנים שיעורים באתר באופן שוטף.';

