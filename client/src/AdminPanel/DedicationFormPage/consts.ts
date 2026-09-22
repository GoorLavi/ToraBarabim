import type { DedicationType } from '@torabarabim/common';

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

export const NAME_LABEL = 'שם המוקדש';
export const NAME_HELPER = 'השם בלבד, כפי שיופיע בשורת השם.';

export const HONORIFIC_LABEL = 'סיומת';
export const HONORIFIC_HELPER = 'עצמאית ממין המוקדש: אפשר לבחור ז״ל עבור אישה, בדיוק כפי שנקבע.';

export const GENDER_LABEL = 'מין המוקדש';
export const GENDER_HELPER = 'קובע בן/בת בשורת ההורה בלבד, עצמאי מהסיומת.';

// The parent line's label depends on the dedication's own type, so it reads
// correctly for a memorial, for healing, and for success.
export const PARENT_NAME_LABEL: Record<DedicationType, string> = {
  memorial: 'שם ההורה של הנפטר/ת',
  healing: 'שם ההורה של מבקש/ת הרפואה',
  success: 'שם ההורה של מבקש/ת ההצלחה',
};
export const PARENT_NAME_HELPER = 'לא חובה. אם מולא, יוצג כ"בן/בת [שם ההורה]".';

export const DONOR_FAMILY_NAME_LABEL = 'שם משפחה לקרדיט תרומה';
export const DONOR_FAMILY_NAME_HELPER = 'לא חובה. אם מולא, יוצג כ"תרומת משפחת [שם המשפחה]".';

export const CLOSING_LINE_LABEL = 'הוספת "תנצב״ה"';
export const CLOSING_LINE_HELPER = 'מוצג רק עבור הקדשות לעילוי נשמה.';

export const STARTS_ON_LABEL = 'תאריך התחלה';
export const ENDS_ON_LABEL = 'תאריך סיום';

export const CANCEL_LABEL = 'ביטול';
export const SAVE_LABEL = 'שמירת ההקדשה';
export const SAVING_LABEL = 'שומרים...';

export const REQUIRED_NAME_ERROR = 'יש למלא את שם המוקדש';
export const REQUIRED_STARTS_ON_ERROR = 'יש למלא תאריך התחלה';
export const REQUIRED_ENDS_ON_ERROR = 'יש למלא תאריך סיום';
export const INVALID_WINDOW_ERROR = 'תאריך הסיום חייב לחול באותו יום כמו תאריך ההתחלה או אחריו';

export const LOADING_MESSAGE = 'טוענים...';
export const RETRY_LABEL = 'ניסיון נוסף';

export const PREVIEW_LABEL = 'תצוגה מקדימה';
export const PREVIEW_BEFORE_READY_MESSAGE = 'התצוגה המקדימה תופיע לאחר בחירת סוג הקדשה ומילוי שם המוקדש.';
export const PREVIEW_LOADING_MESSAGE = 'טוענים תצוגה מקדימה...';
export const PREVIEW_ERROR_MESSAGE = 'לא הצלחנו לטעון את התצוגה המקדימה';
