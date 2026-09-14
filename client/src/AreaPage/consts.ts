import type { Area } from '@torabarabim/common';

import { cityCountLabel, lessonCountLabel } from '~/consts';

export const AREA_PAGE_QUERY_KEYS = {
  detail: (areaSlug: string) => ['area', areaSlug] as const,
  lessons: (area: Area | undefined, pageSize: number) => ['area', area, 'lessons', pageSize] as const,
  otherAreas: () => ['area', 'other-areas'] as const,
};

// A 404 never becomes a 200 by retrying (mirrors CityPage/consts.ts).
export const AREA_PAGE_RETRY_LIMIT = 1;

// One call asking for "enough for a first screenful", matching
// CityPage/consts.ts's CITY_LESSONS_PAGE_SIZE: "load more" asks for a
// bigger page, not a next page to merge in.
export const AREA_LESSONS_PAGE_SIZE = 24;

export const ERROR_HEADING = 'לא הצלחנו לטעון את השיעורים באזור';
export const ERROR_BODY = 'משהו השתבש בדרך אלינו. אפשר לנסות שוב.';
export const RETRY_LABEL = 'נסו שוב';

export const NOT_FOUND_HEADING = 'לא מצאנו את האזור הזה';
export const NOT_FOUND_BODY = 'ייתכן שהכתובת לא מדויקת, או שהאזור לא בלוח.';
export const ALL_CITIES_LABEL = 'לכל הערים';

export const CONTACT_US_LABEL = 'כתבו לנו';

export const OTHER_AREAS_HEADING = 'אזורים אחרים שיש בהם שיעורים';
export const AREA_EMPTY_BODY = 'אנחנו עדיין אוספים שיעורים באזור הזה. אם אתם מכירים שיעור, כתבו לנו ונוסיף אותו.';
export const WINDOW_EMPTY_BODY = 'אפשר לבחור עיר מהרשימה למעלה ולראות מה יש בה. אם אתם מכירים שיעור, כתבו לנו ונוסיף אותו.';

export const areaHeading = (areaName: string): string => `שיעורים באזור ${areaName}`;
export const areaSubheading = (lessonCount: number, cityCount: number): string =>
  `${lessonCountLabel(lessonCount)} בשבועיים הקרובים · ${cityCountLabel(cityCount)}`;
export const citiesHeading = (areaName: string): string => `איפה לומדים באזור ${areaName}`;
export const loadMoreLabel = (areaName: string): string => `עוד שיעורים באזור ${areaName}`;
export const noLessonsHeading = (areaName: string): string => `אין כרגע שיעורים באזור ${areaName}`;
export const windowEmptyHeading = (areaName: string): string => `אין שיעורים באזור ${areaName} בשבועיים הקרובים`;
