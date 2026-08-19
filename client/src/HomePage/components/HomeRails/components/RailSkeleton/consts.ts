export const CARD_KEYS = ['skeleton-card-1', 'skeleton-card-2', 'skeleton-card-3'] as const;

// Mirrors the real `LessonCard` body block's rough height (title, meta and
// city lines plus padding), so the page does not jump in block-size once
// data replaces the skeleton (design review, item 10).
export const SKELETON_BODY_HEIGHT = '104px';
