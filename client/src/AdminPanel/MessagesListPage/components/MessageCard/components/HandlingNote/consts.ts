// Hand-mirrored from the server's own limit: HANDLING_NOTE_MAX_LENGTH in
// server/src/service/visitor-message/consts.ts.
export const NOTE_MAX_LENGTH = 500;
export const NOTE_ROWS = 3;

export const NOTE_LABEL = 'איך טופלה';
export const ADD_NOTE_LABEL = 'הוספת הערה';
export const EDIT_NOTE_LABEL = 'עריכה';
export const SAVE_LABEL = 'שמירה';
export const SAVING_LABEL = 'שומרים...';
export const CANCEL_LABEL = 'ביטול';
export const SAVE_FAILURE_MESSAGE = 'לא הצלחנו לשמור את ההערה. אפשר לנסות שוב.';

// The statuses where `adminErrorMessage`'s own wording says the true thing
// (a session that ended, no connection, a message that no longer exists, too
// many requests). Any other failure is the screen's own approved line.
export const SPECIFIC_FAILURE_STATUSES: readonly number[] = [0, 401, 404, 429];
