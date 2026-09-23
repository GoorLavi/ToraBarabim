// This control's search never had loading, empty or error copy of its own
// before `SearchSelect` required every caller to supply all three.
// `RABBI_SEARCH_EMPTY_MESSAGE` mirrors `AdminPanel/RabbisListPage/consts.ts`'s
// own `NO_MATCHING_RABBIS_HEADLINE`. `RABBI_SEARCH_LOAD_ERROR_MESSAGE` is the
// owner's ratified wording, shared with `RabbiSelect`'s own copy of the same
// line: no retry button is needed because retyping is the retry, so the
// line names the recovery itself.
export const RABBI_SEARCH_LOADING_MESSAGE = 'טוענים...';
export const RABBI_SEARCH_EMPTY_MESSAGE = 'לא נמצאו רבנים תואמים';
export const RABBI_SEARCH_LOAD_ERROR_MESSAGE = 'הטעינה נכשלה, אפשר לנסות שוב';
