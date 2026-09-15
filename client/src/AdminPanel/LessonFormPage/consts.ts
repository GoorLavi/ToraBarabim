import type { Weekday } from '@torabarabim/common';

import type { LessonFormField } from './models';

export const BACK_TO_LIST_LABEL = '→ חזרה לרשימת השיעורים';
export const NEW_LESSON_HEADING = 'שיעור חדש';
// `validateLessonForm` requires every field on the form except the lesson
// title, so this states that instead of naming a shorter, wrong subset.
export const REQUIRED_FIELDS_NOTE = 'כל השדות הם שדות חובה, פרט לשם השיעור.';

export const RABBI_SECTION_HEADING = 'מי מוסר את השיעור';
export const RABBI_SEARCH_PLACEHOLDER = 'חיפוש רב לפי שם';
export const RABBI_SEARCH_LABEL = 'חיפוש רב';
export const RABBI_NOT_LISTED_NOTE = 'הרב לא ברשימה? אפשר להוסיף רב חדש';
// The brief asks for the rabbi's "active-lesson count", but the `Lesson`
// type has no active/paused concept at all today (see the report for this
// slice), so this counts every lesson of theirs in the system.
export const rabbiLessonCountLabel = (count: number): string => (count === 0 ? 'אין לרב הזה שיעורים נוספים' : `${count} שיעורים במערכת`);

export const DETAILS_SECTION_HEADING = 'פרטי השיעור';
export const TITLE_LABEL = 'שם השיעור';
export const TITLE_HELPER = 'אם לא ימולא, יוצג במקומו שם הרב.';

export const WHEN_SECTION_HEADING = 'מתי מתקיים השיעור';
export const WEEKDAY_LABELS_FULL = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'שבת'];

export const WHERE_SECTION_HEADING = 'איפה מתקיים השיעור';
export const CITY_LABEL = 'עיר';
export const CITY_HELPER = 'בוחרים מהרשימה. העיר קובעת גם את האזור.';
export const CITY_PLACEHOLDER = 'בחירת עיר';
export const PLACE_NAME_LABEL = 'שם המקום';
export const STREET_LABEL = 'רחוב ומספר';
export const STREET_HELPER = 'הכתובת המלאה תוצג בעמוד השיעור עצמו בלבד.';
// Optional: a floor or arrival note, for a lesson held in a building where
// finding the right door or floor is not obvious from the street address alone.
export const FLOOR_LABEL = 'קומה / הערת הגעה';

export const AUDIENCE_SECTION_HEADING = 'קהל היעד';
export const AUDIENCE_HELPER = 'יש לבחור אחת מהאפשרויות.';

export const CANCEL_LABEL = 'ביטול';
export const SAVE_AND_ADD_ANOTHER_LABEL = 'שמירה והוספת שיעור נוסף';
export const SAVE_LABEL = 'שמירת השיעור';
export const SAVING_LABEL = 'שומרים...';

export const REQUIRED_RABBI_ERROR = 'יש לבחור רב';
export const REQUIRED_CITY_ERROR = 'יש לבחור עיר';
export const REQUIRED_PLACE_NAME_ERROR = 'יש למלא שם מקום';
export const REQUIRED_STREET_ERROR = 'יש למלא כתובת';
export const REQUIRED_AUDIENCE_ERROR = 'יש לבחור קהל יעד';
export const REQUIRED_START_TIME_ERROR = 'יש למלא שעת התחלה';
export const REQUIRED_DURATION_ERROR = 'יש למלא משך שיעור תקין (בדקות)';
export const REQUIRED_WEEKDAY_ERROR = 'יש לבחור לפחות יום אחד בשבוע';
export const REQUIRED_DATE_ERROR = 'יש לבחור תאריך';

// Groups the form's fields by the visible section they live in, so a
// failed submit can name which sections need attention and jump to the
// first one, per field, on a form long enough that pressing save at the
// bottom otherwise leaves a missed error at the top invisible.
export const SECTION_DEFS: { fields: LessonFormField[]; heading: string }[] = [
  { fields: ['rabbi'], heading: RABBI_SECTION_HEADING },
  { fields: ['recurrence', 'startTime', 'durationMinutes'], heading: WHEN_SECTION_HEADING },
  { fields: ['city', 'placeName', 'street'], heading: WHERE_SECTION_HEADING },
  { fields: ['audience'], heading: AUDIENCE_SECTION_HEADING },
];

export const ERROR_SUMMARY_HEADING = 'יש להשלים כמה שדות לפני השמירה:';

export const LOAD_ERROR_MESSAGE = 'לא הצלחנו לטעון את השיעור';
export const RETRY_LABEL = 'ניסיון נוסף';
export const LOADING_MESSAGE = 'טוענים...';

export const UNKNOWN_RABBI_ERROR = 'הרב שנבחר אינו קיים יותר. בחר רב אחר';
export const UNKNOWN_CITY_ERROR = 'העיר שנבחרה אינה קיימת יותר. בחר עיר אחרת';

export const DEFAULT_DURATION_MINUTES = '60';

export const isWeekday = (value: number): value is Weekday => value >= 0 && value <= 6;
