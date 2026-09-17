export const CITY_ID_PARAM = 'cityId';
export const CITY_NAME_PARAM = 'cityName';
export const RECURRENCE_PARAM = 'recurrence';
export const SEARCH_PARAM = 'q';
// The only place these three params are named as a set (see
// `lessonsListUrlForRabbi` in `helpers.ts`, this filter's one construction
// site) and the only place a caller outside this folder, `RabbiViewPage`,
// needs to know their names.
export const RABBI_ID_PARAM = 'rabbiId';
export const RABBI_NAME_PARAM = 'rabbiName';
export const RABBI_HONORIFIC_PARAM = 'rabbiHonorific';

export const HEADING = 'שיעורים';
export const ADD_LESSON_LABEL = 'הוספת שיעור';
export const SORT_LABEL = 'מיון: המועד הקרוב';
export const CITY_FILTER_PLACEHOLDER = 'כל הערים';
export const RECURRENCE_FILTER_LABEL = 'סוג שיעור';
export const SEARCH_PLACEHOLDER = 'חיפוש לפי שם רב, שם שיעור או מקום';
export const SEARCH_LABEL = 'חיפוש שיעורים';
export const FILTERS_TOGGLE_LABEL = (count: number): string => `סינון · ${count}`;
export const CLEAR_FILTERS_LABEL = 'איפוס הסינון';

export const RECURRENCE_OPTIONS: { value: 'all' | 'weekly' | 'once'; label: string }[] = [
  { value: 'all', label: 'קבוע וחד־פעמי' },
  { value: 'weekly', label: 'קבוע בלבד' },
  { value: 'once', label: 'חד־פעמי בלבד' },
];

export const RECURRING_TAG_LABEL = 'קבוע';
export const ONE_TIME_TAG_LABEL = 'חד־פעמי';
// Was 'עריכה': the row action now opens `LessonViewPage`, a read-only
// screen, so a label promising an edit form would be wrong. Placeholder
// pending Hebrew-editor review; must end up identical to
// `RabbisListPage/consts.ts`'s `EDIT_LABEL`, which names the same action on
// the sibling list.
export const EDIT_LABEL = 'פתיחה';

export const LOADING_MESSAGE = 'טוענים שיעורים...';
export const RETRY_LABEL = 'ניסיון נוסף';
export const ERROR_MESSAGE = 'לא הצלחנו לטעון את השיעורים';

export const NO_LESSONS_HEADLINE = 'עוד אין שיעורים במערכת';
export const NO_LESSONS_HINT = 'הוספת השיעור הראשון תפתח כאן את רשימת השיעורים.';
export const NO_MATCHING_LESSONS_HEADLINE = 'לא נמצאו שיעורים תואמים';
export const NO_MATCHING_LESSONS_HINT = 'נסה לצמצם את הסינון או לנקות אותו כדי לראות את כל השיעורים.';

// Shown instead of `NO_LESSONS_HEADLINE` when the rabbi filter is the only
// active one and it matched nothing: that rabbi genuinely has no lessons
// yet, not "the system is empty" (placeholder copy, Hebrew-editor review).
export const NO_LESSONS_FOR_RABBI_HEADLINE = 'לרב הזה עדיין אין שיעורים';
export const NO_LESSONS_FOR_RABBI_HINT = 'הוספת שיעור תפתח כאן את רשימת השיעורים של הרב.';
export const ADD_LESSON_FOR_RABBI_LABEL = 'הוספת שיעור לרב';

export const rabbiChipRemoveLabel = (rabbiDisplay: string): string => `${rabbiDisplay}, הסרת הסינון`;

// The server returns `total` across the whole system but this screen loads
// only one page of it (see `useAdminLessonsList`), so the honest subheading
// names the loaded count too whenever the two differ, rather than
// implying every lesson is on screen.
export const totalCountLabel = (total: number): string => `${total} שיעורים במערכת`;
// The rabbi-filtered variant: `total` here already excludes every other
// rabbi's lessons, so the "במערכת" (system-wide) wording above would be a
// lie. Placeholder copy, Hebrew-editor review.
export const rabbiFilteredCountLabel = (total: number, rabbiDisplay: string): string => `${total} שיעורים אצל ${rabbiDisplay}`;
export const partialLoadNote = (loaded: number, total: number): string => `מוצגים ${loaded} מתוך ${total} השיעורים`;
