// This control has no counterpart in `RabbiPanel` (a rabbi's own lesson
// form has no rabbi picker at all, since the rabbi is always the signed-in
// one). Two separate strings, not one reused for both jobs: the closed
// control's own placeholder ("nothing chosen yet") and the search field's
// placeholder ("type to search") are different prompts at different
// moments and were previously the same constant doing both jobs.
export const RABBI_SELECT_PLACEHOLDER = 'בחירת רב או רבנית';
export const RABBI_SEARCH_PLACEHOLDER = 'חיפוש לפי שם';
export const RABBI_SEARCH_LABEL = 'חיפוש רב או רבנית לפי שם';
export const RABBI_SEARCH_LOADING_MESSAGE = 'טוען...';
// Owner-ratified, shared with `RabbiPicker`'s own copy of both lines: the
// short empty form over this control's own longer original, and a load
// line that names the recovery (retyping is the retry, so no retry button)
// rather than describing the failure.
export const RABBI_SEARCH_EMPTY_MESSAGE = 'לא נמצאו רבנים תואמים';
export const RABBI_SEARCH_LOAD_ERROR_MESSAGE = 'הטעינה נכשלה, אפשר לנסות שוב';
