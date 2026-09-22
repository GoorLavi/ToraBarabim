// Every string below is this builder's own copy (root CLAUDE.md: "do not
// invent Hebrew beyond the strings quoted in the brief"). Flagged in the
// slice's report for the editor's pass; written to match the rabbi form's
// own voice in the meantime, not treated as final.

export const BACK_TO_LIST_LABEL = '→ חזרה לרשימת המקומות';
export const backToPlaceLabel = (placeName: string): string => `→ חזרה לעמוד ${placeName}`;
export const NEW_PLACE_HEADING = 'מקום חדש';
export const REQUIRED_FIELDS_NOTE = 'שם, עיר ורחוב הם שדות חובה. תמונה וקומה אפשר להוסיף גם אחר כך.';

export const NAME_LABEL = 'שם בית הכנסת או המוסד';
export const NAME_HELPER = 'השם שמוצג לכל שיעור המתקיים במקום הזה.';

export const CITY_LABEL = 'עיר';
export const CITY_HELPER = 'בוחרים מהרשימה. העיר קובעת גם את האזור.';
export const CITY_PLACEHOLDER = 'בחירת עיר';

export const STREET_LABEL = 'רחוב ומספר';
export const FLOOR_LABEL = 'קומה או הוראות הגעה';

export const PHOTO_LABEL = 'תמונת המקום';

export const STATUS_LABEL = 'סטטוס המקום';
export const STATUS_HELPER = 'מקום מושבת נשמר במערכת אך אינו ניתן לבחירה בשיעור חדש. השיעורים שכבר משויכים אליו שומרים את כתובתו.';
export const STATUS_ACTIVE_LABEL = 'פעיל';
export const STATUS_INACTIVE_LABEL = 'מושבת';

export const CANCEL_LABEL = 'ביטול';
export const SAVE_LABEL = 'שמירת המקום';
export const SAVING_LABEL = 'שומרים...';

export const REQUIRED_NAME_ERROR = 'יש למלא שם מקום';
export const REQUIRED_CITY_ERROR = 'יש לבחור עיר';
export const REQUIRED_STREET_ERROR = 'יש למלא רחוב ומספר';
export const UNKNOWN_CITY_ERROR = 'העיר שנבחרה אינה קיימת יותר. יש לבחור עיר אחרת';

export const LOADING_MESSAGE = 'טוענים...';
export const RETRY_LABEL = 'ניסיון נוסף';
