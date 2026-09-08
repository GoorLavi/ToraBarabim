import type { Area } from '@torabarabim/common';

export const BACK_TO_ALL_CITIES_LABEL = 'חזרה לכל הערים';

export const CITY_PAGE_QUERY_KEYS = {
  detail: (cityName: string) => ['city', cityName] as const,
  lessons: (cityCode: string, pageSize: number) => ['city', cityCode, 'lessons', pageSize] as const,
  areaLessons: (area: Area | undefined) => ['city', 'area-lessons', area] as const,
};

// A 404 never becomes a 200 by retrying (mirrors RabbiPage/consts.ts).
export const CITY_PAGE_RETRY_LIMIT = 1;

// No exact number in the design spec for either fetch; both are one call
// asking for "enough for a first screenful" rather than true server-side
// pagination merge, matching the pattern HomePage/consts.ts already uses
// (LESSON_WINDOW_PAGE_SIZE): "load more" asks for a bigger page, not a next
// page to merge in.
export const CITY_LESSONS_PAGE_SIZE = 24;
export const AREA_LESSONS_PAGE_SIZE = 24;

// The server resolves a city's `Area` enum value but not its Hebrew label
// (that only exists on the city directory's grouped response). Mirrors
// server/src/service/shared/consts.ts's AREA_NAMES_HE, which is server-only
// and not on the wire: kept in exact sync by hand, named here as its source.
export const AREA_LABELS: Record<Area, string> = {
  north: 'הצפון',
  haifa: 'חיפה והקריות',
  sharon: 'השרון',
  center: 'המרכז',
  telAviv: 'תל אביב',
  jerusalem: 'ירושלים',
  shfela: 'השפלה',
  south: 'הדרום',
};

export const WHO_TEACHES_HEADING_PREFIX = 'מי מלמד ב';

export const ERROR_HEADING = 'לא הצלחנו לטעון את השיעורים בעיר';
export const ERROR_BODY = 'משהו השתבש בדרך אלינו. אפשר לנסות שוב.';
export const RETRY_LABEL = 'נסו שוב';

export const NOT_FOUND_HEADING = 'לא מצאנו את העיר הזאת';
export const NOT_FOUND_BODY = 'ייתכן שהשם לא מדויק, או שהעיר לא בלוח.';
export const ALL_CITIES_LABEL = 'לכל הערים';

export const CONTACT_US_LABEL = 'כתבו לנו';

export const cityHeading = (cityName: string): string => `שיעורים ב${cityName}`;
export const lessonCountLabel = (count: number): string => (count === 1 ? 'שיעור אחד' : `${count} שיעורים`);
export const citySubheading = (count: number): string => `${lessonCountLabel(count)} בשבועיים הקרובים`;
export const areaLinkLabel = (areaName: string): string => `לכל השיעורים באזור ${areaName}`;
export const whoTeachesHeading = (cityName: string): string => `${WHO_TEACHES_HEADING_PREFIX}${cityName}`;
export const loadMoreLabel = (cityName: string): string => `עוד שיעורים ב${cityName}`;

export const noLessonsHeading = (cityName: string): string => `אין כרגע שיעורים ב${cityName}`;
export const widenedToAreaBody = (cityName: string, areaName: string): string =>
  `הרחבנו לאזור ${areaName}, כדי שלא תישארו בלי כלום. אם אתם מכירים שיעור ב${cityName}, כתבו לנו ונוסיף אותו.`;
export const areaAlsoEmptyBody = (areaName: string): string =>
  `גם באזור ${areaName} אין כרגע שיעורים. אם אתם מכירים שיעור, כתבו לנו ונוסיף אותו.`;
export const areaGroupHeading = (areaName: string): string => `שיעורים באזור ${areaName}`;
