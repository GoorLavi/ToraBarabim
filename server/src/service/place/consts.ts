// At most 3 duplicate-hint matches, offered while filling in a lesson's
// address; never a paged list, since it only ever narrows to one city.
export const PLACE_SIMILAR_LIMIT = 3;

// The two independent floors a place photo's real dimensions must clear.
// Independent on purpose: a 1200x600 photo has a width/height ratio of
// exactly 2.0 (inside the band below) and must still be rejected, on the
// height floor alone. A single `min(width, height)` bound would pass it.
export const PLACE_PHOTO_MIN_WIDTH = 1200;
export const PLACE_PHOTO_MIN_HEIGHT = 675;

// Inclusive band: 16:9 is 1.777, comfortably inside.
export const PLACE_PHOTO_MIN_ASPECT_RATIO = 1.5;
export const PLACE_PHOTO_MAX_ASPECT_RATIO = 2.0;
