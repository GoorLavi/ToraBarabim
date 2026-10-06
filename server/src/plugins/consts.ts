// The calendar routes' rate limit (calendar-rate-limit.ts). Behind the CDN
// only a cache miss reaches this server: a calendar path is cached for an
// hour per URL (client/src/routes/consts.ts's `CALENDAR_CACHE_HEADERS`), so
// the rate at which real subscribers reach it is bounded by the number of
// lessons times the edge locations that serve them, per hour, not by the
// number of subscribers. The ceiling sits far above that, because when the
// visitor address cannot be read every caller shares one bucket and a
// ceiling near the real rate would throttle genuine calendar apps. It exists
// to stop one client hammering the uncached path, not to meter subscribers.
export const CALENDAR_RATE_LIMIT_MAX = 600;
export const CALENDAR_RATE_LIMIT_WINDOW_MS = 60_000;

// Same unverified assumption as the login limit's own position, held
// separately because the calendar paths use the origin request policy that
// forwards no viewer headers, so the hop count at the container may differ.
// The count logged on the first calendar request is how to confirm it.
export const CALENDAR_VISITOR_POSITION_FROM_RIGHT = 2;

// Neutral on purpose: a calendar app, a crawler or a script reads this, not
// someone who just mistyped a password, so it carries none of the login
// limit's wording about attempts.
export const CALENDAR_RATE_LIMITED_MESSAGE = 'יותר מדי בקשות ליומן. אפשר לנסות שוב בעוד רגע.';
