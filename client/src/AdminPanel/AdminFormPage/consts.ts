export const HEADING = 'מנהל חדש';
export const BACK_TO_LIST_LABEL = '→ חזרה לרשימת המנהלים';

export const NAME_LABEL = 'שם';
export const EMAIL_LABEL = 'אימייל להתחברות';
export const USERNAME_LABEL = 'שם משתמש להתחברות';
export const USERNAME_HELPER = 'אפשר להתחבר גם עם שם המשתמש במקום האימייל.';
export const PASSWORD_LABEL = 'סיסמה';
export const CONFIRM_PASSWORD_LABEL = 'אימות סיסמה';

// Mirrors the server's `MIN_PASSWORD_LENGTH` (server/src/service/admin-auth/consts.ts).
export const MIN_PASSWORD_LENGTH = 12;
export const PASSWORD_HELPER = `לפחות ${MIN_PASSWORD_LENGTH} תווים.`;

export const REQUIRED_NAME_ERROR = 'יש למלא שם';
export const REQUIRED_EMAIL_ERROR = 'יש למלא כתובת אימייל';
export const REQUIRED_USERNAME_ERROR = 'יש למלא שם משתמש';
export const INVALID_EMAIL_ERROR = 'כתובת האימייל אינה תקינה';
export const PASSWORD_TOO_SHORT_ERROR = `הסיסמה חייבת להכיל לפחות ${MIN_PASSWORD_LENGTH} תווים`;
export const PASSWORD_MISMATCH_ERROR = 'הסיסמאות אינן תואמות';

export const DUPLICATE_EMAIL_ERROR = 'כתובת האימייל הזו כבר בשימוש';
export const DUPLICATE_USERNAME_ERROR = 'שם המשתמש הזה כבר בשימוש';
export const WEAK_PASSWORD_ERROR = PASSWORD_TOO_SHORT_ERROR;

export const CANCEL_LABEL = 'ביטול';
export const SUBMIT_LABEL = 'יצירת מנהל';
export const SUBMITTING_LABEL = 'יוצרים מנהל...';
