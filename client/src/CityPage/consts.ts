import type { Area } from '@torabarabim/common';

import { LESSON_LIST_PAGE_SIZE, lessonCountLabel } from '~/consts';

export const CITY_PAGE_QUERY_KEYS = {
  detail: (citySlug: string) => ['city', citySlug] as const,
  lessons: (cityCode: string) => ['city', cityCode, 'lessons'] as const,
  areaLessons: (area: Area | undefined) => ['city', 'area-lessons', area] as const,
};

// A 404 never becomes a 200 by retrying (mirrors RabbiPage/consts.ts).
export const CITY_PAGE_RETRY_LIMIT = 1;

// The fixed page size both the main list and the area fallback ask for.
// "Load more" pages through `page` at this fixed size (useCityLessons.ts,
// useLessonListPages.ts), never a growing `pageSize`. Shared with
// WomenPage's own two page sizes through `LESSON_LIST_PAGE_SIZE`, rather
// than four files each retyping the same number.
export const CITY_LESSONS_PAGE_SIZE = LESSON_LIST_PAGE_SIZE;
export const AREA_LESSONS_PAGE_SIZE = LESSON_LIST_PAGE_SIZE;

export const WHO_TEACHES_HEADING_PREFIX = 'מי מלמד ב';

export const ERROR_HEADING = 'לא הצלחנו לטעון את השיעורים בעיר';
export const ERROR_BODY = 'משהו השתבש בדרך אלינו. אפשר לנסות שוב.';
export const RETRY_LABEL = 'נסו שוב';

export const NOT_FOUND_HEADING = 'לא מצאנו את העיר הזאת';
export const NOT_FOUND_BODY = 'ייתכן שהשם לא מדויק, או שהעיר לא בלוח.';
export const ALL_CITIES_LABEL = 'לכל הערים';

export const CONTACT_US_LABEL = 'כתבו לנו';

export const cityHeading = (cityName: string): string => `שיעורים ב${cityName}`;
export const citySubheading = (count: number): string => `${lessonCountLabel(count)} בשבועיים הקרובים`;
export const whoTeachesHeading = (cityName: string): string => `${WHO_TEACHES_HEADING_PREFIX}${cityName}`;
export const loadMoreLabel = (cityName: string): string => `עוד שיעורים ב${cityName}`;
export const LOAD_MORE_ERROR_LABEL = 'לא הצלחנו לטעון עוד שיעורים, נסו שוב';

export const noLessonsHeading = (cityName: string): string => `אין כרגע שיעורים ב${cityName}`;
export const widenedToAreaBody = (cityName: string, areaName: string): string =>
  `הרחבנו לאזור ${areaName}, כדי שלא תישארו בלי כלום. אם אתם מכירים שיעור ב${cityName}, כתבו לנו ונוסיף אותו.`;
export const areaAlsoEmptyBody = (areaName: string): string =>
  `גם באזור ${areaName} אין כרגע שיעורים. אם אתם מכירים שיעור, כתבו לנו ונוסיף אותו.`;
export const areaGroupHeading = (areaName: string): string => `שיעורים באזור ${areaName}`;
