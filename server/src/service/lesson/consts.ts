import { MAX_PAGE_SIZE } from '../shared/consts';

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

// Cards shown in the lesson page's area preview: 4 on a phone, 3 on desktop
// (the client caps the grid at 3 columns there). The server always returns
// the larger, phone count; the client narrows the layout, never the reverse.
export const AREA_PREVIEW_LIMIT = 4;

// `searchAreaPreview` searches the default DEFAULT_RANGE_DAYS window, in
// which a single weekly-or-daily lesson can produce up to DEFAULT_RANGE_DAYS
// occurrences. Fetching AREA_PREVIEW_LIMIT times that many occurrences
// leaves enough distinct lessons after de-duplication even when a thin area
// is dominated by a handful of daily lessons. Clamped to MAX_PAGE_SIZE so it
// can never quietly exceed the ceiling the API enforces everywhere else,
// since this call bypasses the Zod query schema.
export const AREA_PREVIEW_FETCH_SIZE = Math.min(AREA_PREVIEW_LIMIT * DEFAULT_RANGE_DAYS, MAX_PAGE_SIZE);

// The owner's rule: an occurrence dated today leaves every public list this
// long after its start time, whatever its duration. Read by `lesson.search`
// and the home composition through `hasLeftPublicListsAt`.
export const PUBLIC_LIST_GRACE_MINUTES_AFTER_START = 30;
