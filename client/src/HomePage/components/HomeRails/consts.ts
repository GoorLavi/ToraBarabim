export const LOADING_MESSAGE = 'טוען שיעורים...';

// Two rails' worth of skeleton while `GET /v1/home` is in flight, keyed by
// a fixed label rather than an array index since nothing about them varies.
export const SKELETON_RAIL_KEYS = ['skeleton-rail-1', 'skeleton-rail-2'] as const;

export const ERROR_HEADLINE = 'לא הצלחנו לטעון את השיעורים';
export const ERROR_HINT = 'נסו שוב בעוד רגע';
export const RETRY_LABEL = 'נסו שוב';

// The only empty case is zero rows, which with no filters active means the
// site itself has nothing yet.
export const EMPTY_HEADLINE = 'אין כרגע שיעורים באתר';

// The slots, counted in lesson rows (the one `kind: 'courses'` row is never
// counted, helpers.ts's `indexAfterNthLessonRow`). Each band sits after its
// Nth lesson row, or after the last row when there are fewer, so on a thin
// page the bands stay inside the rails block, before the rabbi row, in the
// order women's, success, healing.
export const WOMENS_AREA_BAND_SLOT = 2;
export const SUCCESS_BAND_SLOT = 6;
export const HEALING_BAND_SLOT = 8;
