import type { LessonAudience, Weekday } from '@torabarabim/common';

export const CITY_ID_PARAM = 'cityId';
export const CITY_NAME_PARAM = 'cityName';
export const RECURRENCE_PARAM = 'recurrence';
export const SEARCH_PARAM = 'q';

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
export const EDIT_LABEL = 'עריכה';
export const UNTITLED_RABBI_FALLBACK = 'רב לא ידוע';
export const UNKNOWN_PLACE_FALLBACK = 'מקום לא ידוע';

export const LESSON_AUDIENCE_LABELS: Record<LessonAudience, string> = {
  men: 'גברים',
  women: 'נשים',
  mixed: 'גם גברים וגם נשים',
};

// `Record`, not an array, so indexing by `Weekday` needs no bounds check:
// every `Weekday` (0-6) has an entry by construction.
export const WEEKDAY_LABELS: Record<Weekday, string> = {
  0: 'יום ראשון',
  1: 'יום שני',
  2: 'יום שלישי',
  3: 'יום רביעי',
  4: 'יום חמישי',
  5: 'יום שישי',
  6: 'שבת',
};

// Bare weekday names, without the repeated 'יום', for joining several
// weekdays into one line (see `weeklyRecurrenceLabel` in `helpers.ts`).
export const WEEKDAY_BARE_LABELS: Record<Weekday, string> = {
  0: 'ראשון',
  1: 'שני',
  2: 'שלישי',
  3: 'רביעי',
  4: 'חמישי',
  5: 'שישי',
  6: 'שבת',
};

export const LOADING_MESSAGE = 'טוענים שיעורים...';
export const RETRY_LABEL = 'ניסיון נוסף';
export const ERROR_MESSAGE = 'לא הצלחנו לטעון את השיעורים';

export const NO_LESSONS_HEADLINE = 'עוד אין שיעורים במערכת';
export const NO_LESSONS_HINT = 'הוספת השיעור הראשון תפתח כאן את רשימת השיעורים.';
export const NO_MATCHING_LESSONS_HEADLINE = 'לא נמצאו שיעורים תואמים';
export const NO_MATCHING_LESSONS_HINT = 'נסו לצמצם את הסינון או לנקות אותו כדי לראות את כל השיעורים.';

// The server returns `total` across the whole system but this screen loads
// only one page of it (see `useAdminLessonsList`), so the honest subheading
// names the loaded count too whenever the two differ, rather than
// implying every lesson is on screen.
export const totalCountLabel = (total: number): string => `${total} שיעורים במערכת`;
export const partialLoadNote = (loaded: number, total: number): string => `מוצגים ${loaded} מתוך ${total} השיעורים`;
