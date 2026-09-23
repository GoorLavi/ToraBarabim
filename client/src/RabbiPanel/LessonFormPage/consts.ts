import type { LessonFormField } from './models';

export const BACK_TO_LIST_LABEL = '→ חזרה לשיעורים שלי';
export const NEW_HEADING = 'שיעור חדש';
export const EDIT_HEADING = 'עריכת שיעור';
export const ownershipNote = (rabbiName: string): string =>
  `השיעור רשום על שמך ומופיע באתר תחת "${rabbiName}". כל השדות חובה, חוץ משם השיעור.`;

export const TITLE_LABEL = 'שם השיעור';
export const TITLE_HELPER = 'לא חובה. בלי שם, השיעור יופיע באתר לפי הנושא שנבחר.';

export const WHEN_SECTION_HEADING = 'מתי מתקיים השיעור';
export const WEEKDAYS_LABEL = 'כל שבוע, בימים';
export const START_TIME_LABEL = 'שעת התחלה';
export const DURATION_LABEL = 'כמה זמן השיעור נמשך (בדקות)';

// The WHERE section's own field labels, helpers and validation copy moved
// to `~/components/PlacePicker/consts.ts`, the shared component that now
// renders that section's whole body in both lesson forms.
export const WHERE_SECTION_HEADING = 'איפה מתקיים השיעור';

export const AUDIENCE_SECTION_HEADING = 'למי השיעור מיועד';

export const LIVE_NOTE = 'מה שתשמור כאן יופיע באתר מיד.';
export const SAVE_LABEL = 'שמירת השיעור';
export const SAVING_LABEL = 'שומר...';
export const CANCEL_LABEL = 'ביטול';
export const DELETE_LABEL = 'מחיקת השיעור';

export const ERROR_SUMMARY_HEADING = 'יש להשלים כמה שדות לפני השמירה:';
export const REQUIRED_AUDIENCE_ERROR = 'יש לבחור קהל יעד';
export const REQUIRED_START_TIME_ERROR = 'יש למלא שעת התחלה';
export const REQUIRED_DURATION_ERROR = 'יש למלא משך שיעור תקין (בדקות)';
export const REQUIRED_WEEKDAY_ERROR = 'יש לבחור לפחות יום אחד בשבוע';
export const REQUIRED_DATE_ERROR = 'יש לבחור תאריך';

export const LOADING_MESSAGE = 'טוען...';
export const LOAD_ERROR_MESSAGE = 'לא הצלחנו לטעון את השיעור';
export const RETRY_LABEL = 'ניסיון נוסף';

export const DEFAULT_DURATION_MINUTES = '60';

export const WEEKDAY_LABELS_FULL = ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'שבת'];

// Groups the form's fields by their visible section, mirroring the admin
// form's `SECTION_DEFS` minus the rabbi section this form has none of.
export const SECTION_DEFS: { fields: LessonFormField[]; heading: string }[] = [
  { fields: ['recurrence', 'startTime', 'durationMinutes'], heading: WHEN_SECTION_HEADING },
  { fields: ['city', 'addressName', 'street'], heading: WHERE_SECTION_HEADING },
  { fields: ['audience'], heading: AUDIENCE_SECTION_HEADING },
];
