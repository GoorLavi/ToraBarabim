import { LESSON_LIST_PAGE_SIZE, lessonCountLabel } from '~/consts';

import type { WomenLessonsFilters, WomenLessonsRange } from './models';

export const WOMEN_PAGE_QUERY_KEYS = {
  summary: () => ['women', 'summary'] as const,
  lessons: (filters: WomenLessonsFilters) => ['women', 'lessons', filters] as const,
  areaLessons: (area: string | undefined, range: WomenLessonsRange) => ['women', 'area-lessons', area, range] as const,
  cityLookup: (cityId: string) => ['women', 'city-lookup', cityId] as const,
};

// A 404 never applies to this page (there is no per-city or per-slug
// variant of /women), so only transient failures retry, mirroring
// CityPage/consts.ts, CITY_PAGE_RETRY_LIMIT.
export const WOMEN_PAGE_RETRY_LIMIT = 1;

// The fixed page size "load more" pages through (useLessonListPages.ts),
// and the area fallback asks for in one call. Shared with CityPage's own
// two page sizes through `LESSON_LIST_PAGE_SIZE`, rather than four files
// each retyping the same number.
export const WOMEN_LESSONS_PAGE_SIZE = LESSON_LIST_PAGE_SIZE;
export const AREA_FALLBACK_PAGE_SIZE = LESSON_LIST_PAGE_SIZE;

export const PAGE_TITLE = 'שיעורים לנשים';
export const pageTitleForCity = (cityName: string): string => `שיעורים לנשים ב${cityName}`;

// The four approved subheading shapes collapse to one function: the time
// word is either the rolling window's own phrase or a specific day's label
// (the same `dateLabel` the filtered-empty state uses), and the "· בכל
// הארץ" scope suffix only applies with no city chosen.
export const pageSubheading = (count: number, dateLabel: string | undefined, hasCity: boolean): string => {
  const timeWord = dateLabel ?? 'בשבועיים הקרובים';
  const scopeSuffix = hasCity ? '' : ' · בכל הארץ';
  return `${lessonCountLabel(count)} ${timeWord}${scopeSuffix}`;
};

export const RAIL_HEADING = 'מי מלמד';
export const ALL_RABBANIYOT_LABEL = 'לכל הרבניות';
export const ALL_RABBANIYOT_PATH = '/women/rabbaniyot';

export const CITIES_HEADING = 'לפי עיר';

export const ERROR_HEADING = 'לא הצלחנו לטעון את השיעורים לנשים';
export const ERROR_BODY = 'משהו השתבש בדרך אלינו. אפשר לנסות שוב.';
export const RETRY_LABEL = 'נסו שוב';

export const CONTACT_US_LABEL = 'כתבו לנו';

export const MORE_LABEL = 'עוד שיעורים לנשים';
export const LOADING_MORE_LABEL = 'טוען...';

// The empty-with-city state: reachable only with a city chosen and no date
// or search filter (a date or a search, city or not, goes through the
// filtered-empty state instead, since the widen-to-area card has no
// approved date-aware copy). `noLessonsInCityHeading` is the card's own
// heading regardless of how the area lookup ends; the body depends on it:
// `widenedToAreaBody` while the fallback is still being fetched or once it
// found something, `areaAlsoEmptyBody` once it is known to have nothing
// either, `noAreaFoundBody` (the same closing sentence, without the
// widened clause) when the lookup itself missed or errored, so the card
// never claims a search happened that did not. `widenedGroupHeading` is
// the one heading over the whole widened set below the card, never a
// per-day heading there.
export const noLessonsInCityHeading = (cityName: string): string => `אין כרגע שיעורים לנשים ב${cityName}`;
export const widenedToAreaBody = (areaName: string, cityName: string): string =>
  `הרחבנו את החיפוש לאזור ${areaName}, כדי שלא תישארו בלי כלום. אם אתן מכירות שיעור לנשים ב${cityName}, כתבו לנו. אנחנו בודקים כל שיעור לפני שהוא עולה ללוח.`;
export const areaAlsoEmptyBody = (areaName: string, cityName: string): string =>
  `גם באזור ${areaName} אין כרגע. אם אתן מכירות שיעור לנשים ב${cityName}, כתבו לנו. אנחנו בודקים כל שיעור לפני שהוא עולה ללוח.`;
export const noAreaFoundBody = (cityName: string): string =>
  `אם אתן מכירות שיעור לנשים ב${cityName}, כתבו לנו. אנחנו בודקים כל שיעור לפני שהוא עולה ללוח.`;
export const widenedGroupHeading = (areaName: string): string => `שיעורים לנשים באזור ${areaName}`;

// The empty-with-nothing state: the whole women's set has nothing right now.
export const NOTHING_YET_HEADING = 'עדיין אין שיעורים לנשים בלוח';
export const NOTHING_YET_BODY = 'הלוח עוד בבנייה. אם אתן מכירות שיעור לנשים, כתבו לנו. אנחנו בודקים כל שיעור לפני שהוא עולה ללוח.';

// The filtered-empty state (Figma node 75:709, plan amendments): reachable
// whenever a date or a search is active and nothing matches, city or not.
// The search and search-plus-date headlines carry the query itself, bidi-
// isolated, so they are composed as JSX in WomenPage.tsx rather than as a
// plain string here; this is the date-only shape.
export const FILTERED_EMPTY_SEARCH_PREFIX = 'לא מצאנו שיעורים לנשים עבור "';
export const filteredEmptyDateHeadline = (dateLabel: string): string => `אין שיעורים לנשים ${dateLabel}`;
export const filteredEmptyBothSuffix = (dateLabel: string): string => `" ${dateLabel}`;
export const FILTERED_EMPTY_QUOTE_CLOSE = '"';
export const FILTERED_EMPTY_BODY =
  'יש בלוח שיעורים לנשים, אבל לא כאלה שמתאימים לסינון שבחרתן. אפשר לנקות את הסינון ולראות את כולם.';
export const CLEAR_FILTERS_LABEL = 'ניקוי הסינון';
