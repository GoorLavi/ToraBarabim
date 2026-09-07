// The owner's chosen span for "what's coming up": two weeks, counting today
// as day one, matching `HOME_WINDOW_DAYS`'s convention. Far enough to plan
// around, short enough to stay a quick glance rather than a calendar.
// `GET /v1/rabbi/occurrences` takes no query params, so this is the one and
// only place this number is decided; the client renders whatever span the
// endpoint returns rather than holding a copy of this constant itself.
export const UPCOMING_OCCURRENCE_WINDOW_DAYS = 14;

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
