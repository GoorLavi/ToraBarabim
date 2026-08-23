export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 50;

export const DEFAULT_RANGE_DAYS = 7;
export const MAX_RANGE_DAYS = 90;

// A text search means "find this rabbi", not "find this rabbi tonight": it
// defaults to the next two weeks rather than DEFAULT_RANGE_DAYS, overriding
// an unset `to` even when the caller also left `from` unset. Mirrors
// HOME_WINDOW_DAYS (service/home/consts.ts) and
// UPCOMING_OCCURRENCE_WINDOW_DAYS (service/rabbi-lesson/consts.ts), this
// project's one answer to "how far ahead do we show"; kept as its own
// constant rather than imported, since lesson sits below both of those
// services and importing from either would invert that dependency.
export const TEXT_SEARCH_RANGE_DAYS = 14;

export const MAX_SEARCH_QUERY_LENGTH = 100;
