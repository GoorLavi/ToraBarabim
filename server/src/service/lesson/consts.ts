export const DEFAULT_RANGE_DAYS = 7;
export const MAX_RANGE_DAYS = 90;

export const MAX_SEARCH_QUERY_LENGTH = 100;

// The owner's chosen span for "what's coming up": two weeks, counting today
// as day one. Far enough to plan around, short enough to stay a quick
// glance rather than a calendar. Every "coming up" read shares it, so the
// read models never quietly diverge on how far ahead they look.
export const UPCOMING_OCCURRENCE_WINDOW_DAYS = 14;

// The owner's rule: an occurrence dated today leaves every public list this
// long after its start time, whatever its duration.
export const PUBLIC_LIST_GRACE_MINUTES_AFTER_START = 30;
