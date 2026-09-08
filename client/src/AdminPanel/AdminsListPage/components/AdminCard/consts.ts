import { MIN_PASSWORD_LENGTH, PASSWORD_MISMATCH_ERROR, PASSWORD_TOO_SHORT_ERROR } from '~/AdminPanel/consts';

export { PASSWORD_MISMATCH_ERROR, PASSWORD_TOO_SHORT_ERROR };

export const ACTIVE_LABEL = 'פעיל';
export const INACTIVE_LABEL = 'מושבת';
export const DEACTIVATE_LABEL = 'השבתה';
export const ACTIVATE_LABEL = 'הפעלה';
export const UPDATING_STATUS_LABEL = 'מעדכנים...';
export const CANNOT_MODIFY_SUPER_ADMIN_NOTE = 'מנהל-על, לא ניתן להשבית או למחוק';
export const CANNOT_MODIFY_SUPER_ADMIN_ERROR = 'לא ניתן לשנות מנהל-על';

export const usernameLabel = (username: string): string => `שם משתמש: ${username}`;

export const DELETE_LABEL = 'מחיקה';
export const DELETING_LABEL = 'מוחקים...';
export const DELETE_CONFIRM_HEADING = 'מחיקת מנהל';
export const DELETE_CONFIRM_MESSAGE_PREFIX = 'האם למחוק את ';
export const DELETE_CONFIRM_MESSAGE_SUFFIX = '? הפעולה בלתי הפיכה.';
export const DELETE_CONFIRM_CANCEL_LABEL = 'ביטול';
export const DELETE_CONFIRM_CONFIRM_LABEL = 'כן, למחוק';
export const ADMIN_STILL_ACTIVE_ERROR = 'יש להשבית את המנהל לפני מחיקתו';

export const SET_PASSWORD_LABEL = 'שינוי סיסמה';
export const SET_PASSWORD_DIALOG_HEADING_PREFIX = 'עדכון סיסמה עבור ';
export const NEW_PASSWORD_LABEL = 'סיסמה חדשה';
export const CONFIRM_NEW_PASSWORD_LABEL = 'אימות סיסמה חדשה';
export const PASSWORD_HELPER = `לפחות ${MIN_PASSWORD_LENGTH} תווים.`;
export const WEAK_PASSWORD_ERROR = PASSWORD_TOO_SHORT_ERROR;
export const SET_PASSWORD_CANCEL_LABEL = 'ביטול';
export const SET_PASSWORD_SUBMIT_LABEL = 'שמירת סיסמה';
export const SET_PASSWORD_SUBMITTING_LABEL = 'שומרים...';
