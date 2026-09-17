export const DEFAULT_RANGE_DAYS = 7;
export const MAX_RANGE_DAYS = 90;

export const MAX_SEARCH_QUERY_LENGTH = 100;

// The owner's chosen span for "what's coming up": two weeks, counting today
// as day one. Far enough to plan around, short enough to stay a quick
// glance rather than a calendar. Shared by a rabbi's own upcoming
// occurrences (`GET /v1/rabbi/occurrences`) and an admin's occurrences for
// one lesson (`GET /v1/admin/lessons/:lessonId/occurrences`), so the two
// read models never quietly diverge on how far ahead they look.
export const UPCOMING_OCCURRENCE_WINDOW_DAYS = 14;
