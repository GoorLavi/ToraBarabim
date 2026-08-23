export const HEADING = 'המועדים הקרובים';
export const SUBTEXT =
  'כל השיעורים שלך לפי תאריך, לשבועיים הקרובים. אפשר לבטל מועד אחד או להזיז אותו, בלי לשנות את השיעור הקבוע.';

export const TODAY_LABEL = 'היום';
export const TOMORROW_LABEL = 'מחר';

export const CANCEL_OCCURRENCE_LABEL = 'ביטול המועד';
export const MOVE_OCCURRENCE_LABEL = 'שינוי שעה או מקום';
export const RESTORE_OCCURRENCE_LABEL = 'החזרת המועד';
export const CANCELLED_TAG_LABEL = 'המועד בוטל';
export const movedFromLabel = (time: string): string => `הוזז מ-${time}`;
// One tag for any place change (city, venue name, or street, in any
// combination), never one tag per changed field, and it never names the
// old venue: a venue name is not a fixed width like a time is, and
// naming it wraps the tag to two or three lines (design doc, section 3).
export const PLACE_CHANGED_TAG_LABEL = 'המקום שונה';

export const LOADING_MESSAGE = 'טוען...';

export const EMPTY_FIRST_HEADLINE = 'עוד לא הוספת שיעור';
export const EMPTY_FIRST_HINT =
  'אחרי שתוסיף שיעור, כל המועדים שלו יופיעו כאן לפי תאריך, ותוכל לבטל או להזיז מועד אחד בלחיצה.';
export const EMPTY_FIRST_CTA = 'הוספת השיעור הראשון';

export const EMPTY_WINDOW_HEADLINE = 'אין מועדים בשבועיים הקרובים';
export const EMPTY_WINDOW_HINT = 'השיעורים שלך נשארו במקומם, הם פשוט לא מתקיימים בשבועיים האלה.';
export const EMPTY_WINDOW_CTA = 'לשיעורים שלי';

export const ERROR_HEADLINE = 'לא הצלחנו לטעון את המועדים';
export const ERROR_HINT = 'ייתכן שהחיבור נקטע. אפשר לנסות שוב.';
export const RETRY_LABEL = 'ניסיון נוסף';

export const CANCEL_CONFIRM_HEADING = 'לבטל את השיעור בתאריך הזה?';
export const cancelConfirmBody = (title: string, dayDate: string, time: string): string =>
  `"${title}" ב${dayDate} בשעה ${time}, לא יוצג יותר באתר. שאר השבועות נשארים כרגיל, ואפשר להחזיר את המועד בכל רגע.`;
export const CANCEL_CONFIRM_CONFIRM_LABEL = 'כן, לבטל את המועד';
export const CANCEL_CONFIRM_BACK_LABEL = 'חזרה';

export const MOVE_SHEET_HEADING = 'שינוי המועד הזה';
export const MOVE_START_TIME_LABEL = 'שעת התחלה חדשה';
export const MOVE_PLACE_TOGGLE = 'השיעור יתקיים במקום אחר';
export const MOVE_SCOPE_NOTE = 'השינוי חל על התאריך הזה בלבד.';
export const MOVE_SAVE_LABEL = 'שמירת השינוי';
export const MOVE_SAVING_LABEL = 'שומר...';
// Not named by the design doc for this sheet, only for its cancel sibling
// (`CANCEL_CONFIRM_BACK_LABEL`). Reused here for the same dismiss action,
// so the two sheets read consistently; see the report for this slice.
export const MOVE_BACK_LABEL = 'חזרה';

export const MOVE_CITY_LABEL = 'עיר';
export const MOVE_CITY_PLACEHOLDER = 'בחירת עיר';
export const MOVE_PLACE_NAME_LABEL = 'שם המקום';
export const MOVE_STREET_LABEL = 'רחוב ומספר';

export const REQUIRED_START_TIME_ERROR = 'יש למלא שעת התחלה';
export const REQUIRED_CITY_ERROR = 'יש לבחור עיר';
export const REQUIRED_PLACE_NAME_ERROR = 'יש למלא שם מקום';
export const REQUIRED_STREET_ERROR = 'יש למלא כתובת';

// Duplicated from `LessonsListPage/consts.ts` rather than imported: the two
// screens are siblings, each owning its own copy (client/CLAUDE.md), and
// this is the same "no title" fallback rule as section 4's lesson cards,
// applied here so an untitled lesson's occurrence card is never blank.
export const RECURRING_FALLBACK_TITLE = 'שיעור קבוע';
export const ONE_TIME_FALLBACK_TITLE = 'שיעור חד־פעמי';
