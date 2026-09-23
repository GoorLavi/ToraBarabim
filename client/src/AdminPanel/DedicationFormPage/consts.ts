export const NEW_DEDICATION_HEADING = 'הקדשה חדשה';
export const EDIT_DEDICATION_HEADING = 'עריכת הקדשה';
export const BACK_TO_LIST_LABEL = '→ חזרה לרשימת ההקדשות';
// Edit mode's breadcrumb: the dedication already exists, so "back" returns
// to its own view page rather than the list (mirrors `RabbiFormPage`'s
// `backToRabbiLabel`, which needs an honorific to interpolate; a dedication
// has nothing equivalent worth naming here).
export const BACK_TO_DEDICATION_LABEL = '→ חזרה להקדשה';
export const REQUIRED_FIELDS_NOTE = 'השם, סוג ההקדשה וטווח התאריכים הם שדות חובה.';

export const TYPE_LABEL = 'סוג ההקדשה';

export const NAME_LABEL = 'השם שיופיע בהקדשה';
export const NAME_HELPER = 'רק השם עצמו, כפי שיופיע בהקדשה.';

export const HONORIFIC_LABEL = 'תוספת לשם';
export const HONORIFIC_HELPER = 'הבחירה כאן אינה תלויה במין: אפשר לבחור ז״ל גם לאישה.';

export const GENDER_LABEL = 'בן או בת';
export const GENDER_HELPER = 'קובע רק אם יופיע בן או בת לפני שם ההורה.';

export const PARENT_NAME_HELPER = 'לא חובה. אם ימולא, יתווסף לשם בן או בת ואחריו שם ההורה.';
// Shown only for a success dedication, beside the shared helper above: the
// label already reads "שם האב או האם" (`DEDICATION_PARENT_NAME_LABELS`),
// but the owner wants it said again in plain words, since a memorial and a
// healing prayer each name one specific parent and success is the one type
// where the admin might otherwise wonder which one to type.
export const PARENT_NAME_SUCCESS_HELPER = 'אפשר למלא את שם האב או את שם האם, לפי הנהוג במשפחה.';

export const DONOR_FAMILY_NAME_LABEL = 'שם המשפחה התורמת';
export const DONOR_FAMILY_NAME_HELPER = 'לא חובה. אם ימולא, תתווסף בסוף ההקדשה השורה תרומת משפחת ואחריה השם.';

export const CLOSING_LINE_LABEL = 'הוספת תנצב״ה';
export const CLOSING_LINE_HELPER = 'מופיע רק בהקדשות לעילוי נשמה.';

export const STARTS_ON_LABEL = 'תאריך התחלה';
export const ENDS_ON_LABEL = 'תאריך סיום';

export const CANCEL_LABEL = 'ביטול';
export const SAVE_LABEL = 'שמירת ההקדשה';
export const SAVING_LABEL = 'שומרים...';

export const REQUIRED_NAME_ERROR = 'יש למלא את השם שיופיע בהקדשה';
export const REQUIRED_STARTS_ON_ERROR = 'יש למלא תאריך התחלה';
export const REQUIRED_ENDS_ON_ERROR = 'יש למלא תאריך סיום';
export const INVALID_WINDOW_ERROR = 'תאריך הסיום לא יכול להקדים את תאריך ההתחלה';

export const LOADING_MESSAGE = 'טוענים...';
export const RETRY_LABEL = 'ניסיון נוסף';

export const PREVIEW_LABEL = 'תצוגה מקדימה';
export const PREVIEW_BEFORE_READY_MESSAGE = 'התצוגה המקדימה תופיע אחרי מילוי השם.';
export const PREVIEW_LOADING_MESSAGE = 'טוענים תצוגה מקדימה...';
export const PREVIEW_ERROR_MESSAGE = 'לא הצלחנו לטעון את התצוגה המקדימה';
