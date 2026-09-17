export const BACK_TO_LIST_LABEL = '→ חזרה לרשימת השיעורים';
export const EDIT_LABEL = 'עריכה';

export const LOADING_MESSAGE = 'טוענים את פרטי השיעור...';
export const RETRY_LABEL = 'ניסיון נוסף';

export const TITLE_LABEL = 'שם השיעור';
// Matches `LessonFormPage`'s own `titleHelper` wording for the same case.
// Honorific-aware: pass the loaded rabbi's `RABBI_HONORIFIC_LABELS[honorific]`
// (`~/consts.ts`).
export const titleEmptyValue = (honorific: string): string => `לא הוזן, ובמקומו מוצג שם ${honorific}`;
// Falls back to this only when the rabbi itself failed to resolve (see
// `RABBI_UNKNOWN_LABEL`), so there is no honorific to build the normal
// message from.
export const TITLE_EMPTY_VALUE_UNKNOWN_RABBI = 'לא הוזן';

export const RECURRENCE_KIND_LABEL = 'סוג השיעור';
export const RECURRING_VALUE = 'קבוע';
export const ONE_TIME_VALUE = 'חד־פעמי';
export const WHEN_LABEL = 'מועד';
export const START_TIME_LABEL = 'שעת התחלה';
export const DURATION_LABEL = 'משך השיעור';
export const durationValue = (minutes: number): string => (minutes === 1 ? 'דקה אחת' : `${minutes} דקות`);

export const CITY_LABEL = 'עיר';
export const PLACE_NAME_LABEL = 'שם המקום';
export const STREET_LABEL = 'רחוב ומספר';
export const FLOOR_LABEL = 'קומה או הוראות הגעה';

export const AUDIENCE_LABEL = 'למי מיועד';

export const RABBI_UNKNOWN_LABEL = 'לא נמצאו פרטי הרב';

export const SKELETON_FIELD_COUNT = 8;
