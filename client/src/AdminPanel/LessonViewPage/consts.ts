export const BACK_TO_LIST_LABEL = '→ חזרה לרשימת השיעורים';
export const EDIT_LABEL = 'עריכה';

export const LOADING_MESSAGE = 'טוענים...';
export const RETRY_LABEL = 'ניסיון נוסף';

export const TITLE_LABEL = 'שם השיעור';
// Matches `LessonFormPage`'s own `TITLE_HELPER` wording for the same case.
export const TITLE_EMPTY_VALUE = 'לא הוזן, מוצג שם הרב במקומו';

export const RECURRENCE_KIND_LABEL = 'סוג שיעור';
export const RECURRING_VALUE = 'קבוע';
export const ONE_TIME_VALUE = 'חד־פעמי';
export const WHEN_LABEL = 'מתי';
export const START_TIME_LABEL = 'שעת התחלה';
export const DURATION_LABEL = 'משך השיעור';
export const durationValue = (minutes: number): string => `${minutes} דקות`;

export const CITY_LABEL = 'עיר';
export const PLACE_NAME_LABEL = 'שם המקום';
export const STREET_LABEL = 'רחוב ומספר';
export const FLOOR_LABEL = 'קומה / הערת הגעה';

export const AUDIENCE_LABEL = 'קהל היעד';

export const RABBI_UNKNOWN_LABEL = 'פרטי הרב אינם זמינים';

// `fieldCount` is fixed per render and the list is never reordered or
// spliced, so no placeholder can change position under a mounted node
// (same reasoning as `LessonsGridSkeleton`'s `skeletonCardKeys`).
export const skeletonFieldKeys = (fieldCount: number): string[] =>
  Array.from({ length: fieldCount }, (_, index) => `skeleton-field-${index}`);
