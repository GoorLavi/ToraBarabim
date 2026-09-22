// This control has no counterpart in `RabbiPanel` (a rabbi's own lesson
// form has no rabbi picker at all, since the rabbi is always the signed-in
// one). Two separate strings, not one reused for both jobs: the closed
// control's own placeholder ("nothing chosen yet") and the search field's
// placeholder ("type to search") are different prompts at different
// moments and were previously the same constant doing both jobs.
export const RABBI_SELECT_PLACEHOLDER = 'בחירת רב או רבנית';
export const RABBI_SEARCH_PLACEHOLDER = 'חיפוש לפי שם';
export const RABBI_SEARCH_LABEL = 'חיפוש רב או רבנית לפי שם';
export const RABBI_NO_RESULTS_MESSAGE = 'לא מצאנו רב או רבנית בשם הזה.';
export const RABBI_DIRECTORY_ERROR_MESSAGE = 'לא הצלחנו לטעון את רשימת הרבנים והרבניות.';
