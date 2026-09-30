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

// After the second lesson row, before the third: one rail in three, never
// after every rail (design review). The one `kind: 'courses'` row is never
// counted towards this (plan section 10.7, helpers.ts's `indexAfterNthLessonRow`).
// With fewer than three lesson rows this clamps to the end of the list,
// still inside the rails block and still before `לפי רב`.
export const WOMENS_AREA_BAND_SLOT = 2;
