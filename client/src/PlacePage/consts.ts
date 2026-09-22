import type { Area } from '@torabarabim/common';

import { LESSON_LIST_PAGE_SIZE } from '~/consts';

export const BACK_TO_ALL_PLACES_LABEL = 'חזרה לכל המקומות';

export const PLACE_PAGE_QUERY_KEYS = {
  detail: (placeId: string) => ['place', placeId] as const,
  lessons: (placeId: string) => ['place', placeId, 'lessons'] as const,
  // Not parameterised by placeId: this is the "other lessons in the same
  // city" fallback, keyed on the city's own slug (design spec, "the empty
  // state widens to the city").
  widenedCityLessons: (citySlug: string) => ['place', 'widened-city-lessons', citySlug] as const,
  // The second widening step, only fired once the city one comes back empty
  // too (design gate finding F2): keyed on the area rather than the city,
  // mirroring CityPage/consts.ts's own areaLessons key.
  widenedAreaLessons: (area: Area | undefined) => ['place', 'widened-area-lessons', area ?? ''] as const,
};

// A 404 never becomes a 200 by retrying (mirrors RabbiPage/consts.ts,
// CityPage/consts.ts).
export const PLACE_PAGE_RETRY_LIMIT = 1;

// The fixed page size "load more" pages through, mirroring CityPage's own
// CITY_LESSONS_PAGE_SIZE: one shared number so a change to it cannot leave
// either page stale.
export const PLACE_LESSONS_PAGE_SIZE = LESSON_LIST_PAGE_SIZE;

// The widen-to-city fallback's own page size: small, since it is a
// fallback, not a listing (mirrors RabbiPage/consts.ts,
// NATIONWIDE_LESSONS_PAGE_SIZE).
export const WIDENED_CITY_LESSONS_PAGE_SIZE = 4;

// The second widening step's own page size, same reasoning as the city
// one above (design gate finding F2).
export const WIDENED_AREA_LESSONS_PAGE_SIZE = 4;

export const ERROR_HEADING = 'לא הצלחנו לטעון את פרטי המקום';
export const ERROR_BODY = 'משהו השתבש בדרך אלינו. אפשר לנסות שוב.';
export const RETRY_LABEL = 'נסו שוב';

export const NOT_FOUND_HEADING = 'לא מצאנו את המקום הזה';
export const NOT_FOUND_BODY = 'ייתכן שהמקום הוסר, או שהקישור לא מדויק.';
export const ALL_PLACES_LABEL = 'לכל המקומות';

export const LESSONS_ERROR_HEADING = 'לא הצלחנו לטעון את השיעורים';
export const LESSONS_ERROR_BODY = 'משהו השתבש בדרך אלינו. אפשר לנסות שוב.';

// Ratified copy, given verbatim in the build brief.
export const EMPTY_HEADING = 'אין כרגע שיעורים במקום הזה';
export const CONTACT_US_LABEL = 'כתבו לנו';

export const LOAD_MORE_ERROR_LABEL = 'לא הצלחנו לטעון עוד שיעורים, נסו שוב';
export const LOAD_MORE_LABEL = 'עוד שיעורים במקום הזה';

export const otherCityLessonsHeading = (cityName: string): string => `שיעורים אחרים ב${cityName}`;
export const otherAreaLessonsHeading = (areaName: string): string => `שיעורים באזור ${areaName}`;

// While the widened fetch is still pending its body optimistically reads as
// "widened", correcting to the "also empty" copy once resolved (mirrors
// CityPage/consts.ts's widenedToAreaBody/areaAlsoEmptyBody).
export const widenedToCityBody = (cityName: string): string =>
  `הרחבנו לכל ${cityName}, כדי שלא תישארו בלי כלום. אם אתם מכירים שיעור במקום הזה, כתבו לנו ונוסיף אותו.`;
// The double-empty case (design gate finding F2): the city has nothing
// either, so the body now points at the area cascade below it instead of
// dead-ending on `כתבו לנו` alone.
export const cityAlsoEmptyBody = (cityName: string): string =>
  `גם ב${cityName} אין כרגע שיעורים נוספים, אז הרחבנו לכל האזור, כדי שלא תישארו בלי כלום.`;
