export const SECTION_HEADING = 'המועדים הקרובים';
export const SECTION_NOTE = 'כל שינוי כאן חל על התאריך הזה בלבד ונשמר מיד. השיעור הקבוע לא משתנה.';

export const LOADING_LABEL = 'טוענים את המועדים הקרובים...';

export const ERROR_HEADLINE = 'לא הצלחנו לטעון את המועדים הקרובים';
export const ERROR_HINT = 'ייתכן שהחיבור נקטע. אפשר לנסות שוב.';
export const RETRY_LABEL = 'ניסיון נוסף';

export const EMPTY_HEADLINE = 'אין מועדים בשבועיים הקרובים';
export const EMPTY_HINT = 'השיעור נשאר כרגיל, הוא פשוט לא חל בטווח הזה.';

export const EXCEPTIONS_UNAVAILABLE_MESSAGE = 'לא ניתן לטעון את פרטי החריגים כרגע, ולכן אי אפשר לערוך או להחזיר מועדים ששונו כבר. אפשר לנסות שוב.';

export const CANCELLED_TAG_LABEL = 'המועד בוטל';
export const PLACE_CHANGED_TAG_LABEL = 'המקום שונה';
export const movedFromLabel = (time: string): string => `הוזז מ-${time}`;

export const CANCEL_OCCURRENCE_LABEL = 'ביטול המועד';
export const MOVE_OCCURRENCE_LABEL = 'שינוי שעה או מקום';
export const RESTORE_OCCURRENCE_LABEL = 'החזרת המועד';
export const ROW_UNAVAILABLE_LABEL = 'לא ניתן לערוך כרגע';

export const CANCEL_SHEET_HEADING = 'לבטל את השיעור בתאריך הזה?';
export const cancelSheetBody = (dateLabel: string, time: string): string =>
  `בתאריך ${dateLabel} בשעה ${time}, השיעור לא יוצג יותר באתר. שאר המועדים נשארים כרגיל, ואפשר להחזיר את המועד בכל רגע.`;
export const CANCEL_REASON_LABEL = 'סיבת הביטול (לא חובה)';
export const CANCEL_CONFIRM_LABEL = 'כן, לבטל את המועד';
export const CANCEL_BACK_LABEL = 'חזרה';

export const MOVE_SHEET_HEADING = 'שינוי המועד הזה';
export const MOVE_START_TIME_LABEL = 'שעת התחלה חדשה';
export const MOVE_PLACE_TOGGLE = 'השיעור יתקיים במקום אחר';
export const MOVE_SCOPE_NOTE = 'השינוי חל על התאריך הזה בלבד.';
export const MOVE_SAVE_LABEL = 'שמירת השינוי';
export const MOVE_SAVING_LABEL = 'שומר...';
export const MOVE_BACK_LABEL = 'חזרה';

export const MOVE_CITY_LABEL = 'עיר';
export const MOVE_CITY_PLACEHOLDER = 'בחירת עיר';
export const MOVE_PLACE_NAME_LABEL = 'שם המקום';
export const MOVE_STREET_LABEL = 'רחוב ומספר';

export const REQUIRED_START_TIME_ERROR = 'יש למלא שעת התחלה';
export const REQUIRED_CITY_ERROR = 'יש לבחור עיר';
export const REQUIRED_PLACE_NAME_ERROR = 'יש למלא שם מקום';
export const REQUIRED_STREET_ERROR = 'יש למלא כתובת';
