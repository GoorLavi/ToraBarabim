export const LOADING_MESSAGE = 'טוען שיעורים...';
export const ERROR_MESSAGE = 'לא הצלחנו לטעון את השיעורים';

// The rabbi's own lesson count says there should be at least one occurrence
// in the window; an empty fetched list despite that is a real but unusual
// gap (the window closed before the next recurrence), not the "no lessons
// at all" case the empty-state block already owns.
export const NO_UPCOMING_OCCURRENCES_MESSAGE = 'אין שיעורים קרובים בטווח התאריכים הנוכחי';

// Enough rows to fill the loading skeleton without pretending to know the
// real count in advance.
export const SKELETON_ROW_KEYS = ['s1', 's2', 's3'];
