// The owner's chosen span for "what's coming up": two weeks, counting today
// as day one, matching `HOME_WINDOW_DAYS`'s convention. Far enough to plan
// around, short enough to stay a quick glance rather than a calendar.
// `GET /v1/rabbi/occurrences` takes no query params, so this is the one and
// only place this number is decided; the client renders whatever span the
// endpoint returns rather than holding a copy of this constant itself.
export const UPCOMING_OCCURRENCE_WINDOW_DAYS = 14;
