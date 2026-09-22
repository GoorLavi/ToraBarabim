// A place's own lesson list never grows past a handful of records, the
// same shape as a rabbi's own list (`rabbi-lesson/consts.ts`): a place
// typically hosts a few weekly shiurim, not hundreds, so the client always
// requests one page that holds everything.
export const DEFAULT_PLACE_PAGE = 1;
export const MAX_PLACE_PAGE_SIZE = 100;
export const DEFAULT_PLACE_PAGE_SIZE = MAX_PLACE_PAGE_SIZE;
