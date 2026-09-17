export const SECTION_HEADING = 'המועדים הקרובים';
// The trailing clause is only true of a recurring lesson: a one-time
// lesson has no "regular lesson" behind this date to leave unchanged.
// `sectionNote` below renders it only when `lesson.recurrence.kind ===
// 'weekly'`; the base sentence reads correctly on its own either way.
export const SECTION_NOTE_BASE = 'כל שינוי כאן חל על התאריך הזה בלבד ונשמר מיד.';
export const SECTION_NOTE_RECURRING_CLAUSE = 'השיעור הקבוע לא משתנה.';
export const sectionNote = (isWeeklyRecurrence: boolean): string =>
  isWeeklyRecurrence ? `${SECTION_NOTE_BASE} ${SECTION_NOTE_RECURRING_CLAUSE}` : SECTION_NOTE_BASE;

export const LOADING_LABEL = 'טוענים את המועדים הקרובים...';

export const ERROR_HEADLINE = 'לא הצלחנו לטעון את המועדים';
export const ERROR_HINT = 'ייתכן שהחיבור נקטע. אפשר לנסות שוב.';
export const RETRY_LABEL = 'ניסיון נוסף';

export const EMPTY_HEADLINE = 'אין מועדים בשבועיים הקרובים';
export const EMPTY_HINT = 'השיעור נשאר במקומו, הוא פשוט לא מתקיים בשבועיים האלה.';

// Covers a cancelled row too, not only a moved one: `hasExistingException`
// (helpers.ts) is true for both, and a cancelled row loses its restore
// button the same way a moved row loses its edit ability.
export const EXCEPTIONS_UNAVAILABLE_MESSAGE = 'פרטי השינויים לא נטענו כרגע, ולכן לא ניתן לערוך או להחזיר מועדים שכבר שונו או בוטלו. אפשר לנסות שוב.';

export const CANCELLED_TAG_LABEL = 'המועד בוטל';
export const PLACE_CHANGED_TAG_LABEL = 'המקום שונה';
export const movedFromLabel = (time: string): string => `הוזז מ-${time}`;

export const CANCEL_OCCURRENCE_LABEL = 'ביטול המועד';
export const MOVE_OCCURRENCE_LABEL = 'שינוי שעה או מקום';
export const RESTORE_OCCURRENCE_LABEL = 'החזרת המועד';

export const CANCEL_SHEET_HEADING = 'לבטל את השיעור בתאריך הזה?';
// `dateLabel` already opens with the weekday name (`occurrenceDateLabel`,
// helpers.ts), so gluing it after "בתאריך" read as "בתאריך יום שלישי,
// 16.12.2025", the date naming its own kind twice. The restore clause is
// only true of a recurring lesson's other dates ("שאר המועדים"), so
// `cancelSheetBody` renders it only when `isWeeklyRecurrence`; a one-time
// lesson still gets the plain "can restore" sentence on its own.
export const cancelSheetBody = (dateLabel: string, time: string, isWeeklyRecurrence: boolean): string => {
  const opening = `השיעור ב${dateLabel} בשעה ${time} לא יוצג יותר באתר.`;
  const restoreClause = 'אפשר להחזיר את המועד בכל רגע.';
  return isWeeklyRecurrence ? `${opening} שאר המועדים נשארים כרגיל, ו${restoreClause}` : `${opening} ${restoreClause}`;
};
export const CANCEL_REASON_LABEL = 'סיבת הביטול';
// The two-line version rendered as three at 390 (the designer's own
// layout call), so this single line is what ships: it still carries both
// the optionality and the disclosure, tied to the textarea via
// `aria-describedby`.
export const CANCEL_REASON_HELPER = 'לא חובה. הסיבה מוצגת באתר לכל מי שנכנס לעמוד השיעור, ועוזרת למי שתכנן להגיע.';
export const CANCEL_CONFIRM_LABEL = 'כן, לבטל את המועד';
export const CANCEL_SAVING_LABEL = 'מבטלים...';
export const CANCEL_BACK_LABEL = 'חזרה';

export const MOVE_SHEET_HEADING = 'שינוי המועד הזה';
export const MOVE_START_TIME_LABEL = 'שעת התחלה חדשה';
export const MOVE_PLACE_TOGGLE = 'השיעור יתקיים במקום אחר';
export const MOVE_SCOPE_NOTE = 'השינוי חל על התאריך הזה בלבד.';
export const MOVE_SAVE_LABEL = 'שמירת השינוי';
// First person plural, matching the rest of the admin panel's voice
// (`LOADING_LABEL` above, "טוענים"): the singular "שומר" is the rabbi
// panel's own voice, copied in here by mistake.
export const MOVE_SAVING_LABEL = 'שומרים...';
export const MOVE_BACK_LABEL = 'חזרה';

export const MOVE_CITY_LABEL = 'עיר';
export const MOVE_CITY_PLACEHOLDER = 'בחירת עיר';
export const MOVE_PLACE_NAME_LABEL = 'שם המקום';
export const MOVE_STREET_LABEL = 'רחוב ומספר';

// Read only on this sheet: it edits the time and place, and has no control
// for either, so these are shown, never blank fields to fill in.
export const SUBSTITUTE_RABBI_LABEL = 'רב ממלא מקום';
export const NOTE_LABEL = 'הערה';

export const REQUIRED_START_TIME_ERROR = 'יש למלא שעת התחלה';
export const REQUIRED_CITY_ERROR = 'יש לבחור עיר';
export const REQUIRED_PLACE_NAME_ERROR = 'יש למלא שם מקום';
export const REQUIRED_STREET_ERROR = 'יש למלא כתובת';
