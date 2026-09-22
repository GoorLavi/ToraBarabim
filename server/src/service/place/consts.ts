// At most 3 duplicate-hint matches, offered while filling in a lesson's
// address; never a paged list, since it only ever narrows to one city.
export const PLACE_SIMILAR_LIMIT = 3;

// The two independent floors a place photo's real dimensions must clear.
// Independent on purpose: an 800x400 photo has a width/height ratio of
// exactly 2.0 (inside the band below) and must still be rejected, on the
// height floor alone. A single `min(width, height)` bound would pass it.
// 800x450 is roughly twice the hero's own rendered size (320x180 from `lg`
// up, about 358x201 full-bleed on a phone), not a number pulled from a
// camera spec sheet.
export const PLACE_PHOTO_MIN_WIDTH = 800;
export const PLACE_PHOTO_MIN_HEIGHT = 450;

// The one wording of the photo rejection, built from the floors above so a
// change to either can never leave the sentence claiming the old numbers.
// Both upload routes (admin/places and place/profile) send it, and they
// must not be able to disagree. Dimensions read as "800 על 450": a Latin
// multiplication sign between two numbers is bidi-neutral, inherits the
// paragraph's direction, and renders the pair reversed inside Hebrew. It
// names no aspect ratio, deliberately: the panel crops to 16:9 for the
// person now, so asking them to satisfy a ratio by hand would be false.
export const INVALID_PHOTO_MESSAGE = `התמונה לא מתאימה. צריך תמונה לרוחב, לפחות ${PLACE_PHOTO_MIN_WIDTH} על ${PLACE_PHOTO_MIN_HEIGHT} פיקסלים.`;

// The one wording of the unsupported-file-type rejection, kept identical to
// the client's own copy (`components/PhotoPicker/consts.ts`'s
// `UNSUPPORTED_TYPE_ERROR`) so the same rejection never reads two ways
// depending on which side caught it first. Both upload routes (admin/places
// and place/profile) send it. A place accepts only jpg or png; a rabbi photo
// also accepts webp, so that route keeps its own, genuinely different wording.
export const UNSUPPORTED_PHOTO_TYPE_MESSAGE = 'אפשר להעלות קובץ JPG או PNG בלבד';

// Inclusive band: 16:9 is 1.777, comfortably inside.
export const PLACE_PHOTO_MIN_ASPECT_RATIO = 1.5;
export const PLACE_PHOTO_MAX_ASPECT_RATIO = 2.0;
