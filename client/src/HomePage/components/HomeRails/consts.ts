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
