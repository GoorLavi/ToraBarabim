// A rabbi's own lesson list never grows past a handful of records (design
// doc, section 4: he has three lessons, not three hundred), so the client
// always requests one page that holds everything. This is that page
// size's source of truth; the client's own `RABBI_LESSON_PAGE_SIZE`
// mirrors it. It must not be confused with `admin-shared`'s page-size
// constants, which bound a genuinely paginated admin list and are half
// this size.
export const DEFAULT_RABBI_PAGE = 1;
export const MAX_RABBI_PAGE_SIZE = 100;
export const DEFAULT_RABBI_PAGE_SIZE = MAX_RABBI_PAGE_SIZE;
