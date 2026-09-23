// Mirrors `AdminPanel/RabbisListPage/consts.ts`'s own `NO_MATCHING_RABBIS_HEADLINE`
// and `ERROR_MESSAGE`: this control's search never had empty or error copy
// of its own before `SearchSelect` required every caller to supply it, so
// this reuses the admin section's own established wording for the same
// entity rather than inventing new copy.
export const RABBI_SEARCH_EMPTY_MESSAGE = 'לא נמצאו רבנים תואמים';
export const RABBI_SEARCH_ERROR_MESSAGE = 'לא הצלחנו לטעון את הרבנים';
