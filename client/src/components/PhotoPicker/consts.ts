import type { PhotoPickerAspectRatio } from './models';

// Hand-mirrored from `server/src/service/place/consts.ts`'s
// `PLACE_PHOTO_MIN_WIDTH` / `PLACE_PHOTO_MIN_HEIGHT`: no shared import path
// to the server's own values (`@torabarabim/common` is types only), so this
// is a separate copy naming its source. The server's own ratio band (1.5 to
// 2.0) has no client mirror any more: the crop step below always produces an
// exact 16:9 crop, which clears that band by construction, so there is
// nothing left for a client-side ratio check or a ratio line in the help
// text to do. Exported for the crop step's own floor, read from
// `helpers.ts`.
export const PLACE_PHOTO_MIN_WIDTH = 800;
export const PLACE_PHOTO_MIN_HEIGHT = 450;

// The one client-side copy of the server's `invalid_photo` rejection
// (`server/src/api/admin/places/index.ts`, `server/src/api/place/profile/index.ts`):
// shown as-is rather than a generic 400 message, since it already names the
// floor the photo failed. Read by `PlacePanel/consts.ts` and `AdminPanel/consts.ts`
// rather than each holding its own copy, which is how this string went stale
// the first time.
export const INVALID_PHOTO_MESSAGE = `התמונה לא מתאימה. צריך תמונה לרוחב, בגודל ${PLACE_PHOTO_MIN_WIDTH} על ${PLACE_PHOTO_MIN_HEIGHT} פיקסלים לפחות.`;

// The 16:9 frame otherwise takes the field's full width with no ceiling
// (styles.ts). Hand-mirrored from PlacePage/components/PlaceHero/consts.ts's
// own PHOTO_WIDTH_DESKTOP (no shared import path: a shared component must
// not reach into a page's internals for one number): the photo ships in the
// place hero at exactly that width, so a wider preview here shows a
// composition the visitor never sees, and the crop tuned against a bigger
// frame is not the crop that ships. A preview is only a preview at the size
// the thing actually ships at (design gate finding F7, which also measured
// and rejected the fold as the reason: at 1280x900 the profile form's save
// button sits 164px past the fold either way, and this value recovers only
// 90px of that).
export const PHOTO_PICKER_16X9_FRAME_MAX_WIDTH = 320;

// The 3:4 frame's own fixed width (styles.ts), named here so the uploading
// column below it can match it exactly rather than carrying a second, silent
// copy of the same number (design gate nits: the progress bar and status
// line rendered narrower than the frame above them, a ragged edge).
export const PHOTO_PICKER_3X4_FRAME_WIDTH = 160;

// One noun for one thing across all three buttons: the field is called
// "התמונה שלי" in the panel, so "קובץ" is kept only for the lines that are
// actually about the file format.
export const PHOTO_CHOOSE_LABEL = 'בחירת תמונה';
export const PHOTO_REPLACE_LABEL = 'החלפת תמונה';
export const PHOTO_HELP_TYPE = 'JPG או PNG, עד 5MB';

// Dimensions read as "900 על 1200", never "900x1200": a multiplication sign
// between two numbers is bidi-neutral, inherits the paragraph's direction,
// and renders the pair reversed to anyone reading it as a Latin unit.
// Keyed by ratio, the single place this component's size requirement
// changes: '3:4' is every rabbi's portrait, cropped on display with no
// in-browser tool; '16:9' is a place's own photo, which now gets cropped to
// shape before it ever uploads, so its own line describes that step instead
// of a rejection. Copy approved by `tora-hebrew-editor`.
export const PHOTO_HELP_SIZE: Record<PhotoPickerAspectRatio, string> = {
  '3:4': 'לפחות 900 על 1200 פיקסלים',
  '16:9': `לפחות ${PLACE_PHOTO_MIN_WIDTH} על ${PLACE_PHOTO_MIN_HEIGHT} פיקסלים. אחרי הבחירה אפשר לסמן איזה חלק מהתמונה יופיע באתר.`,
};

// '3:4' only: the poster is cropped on display with no in-browser tool, so
// the reader needs to know to keep the face away from the edge. '16:9' had
// the same kind of line for the same reason (an accepted photo could still
// lose its sides on display), but the crop step now produces exactly the
// ratio the hero displays at, so nothing is cropped a second time and the
// line no longer applies; removed rather than kept beside the new '16:9'
// help text above (build brief for the crop step).
export const PHOTO_HELP_CROP: Partial<Record<PhotoPickerAspectRatio, string>> = {
  '3:4': 'בכרטיס באתר התמונה נחתכת ליחס 3:4, לכן כדאי שהפנים יהיו במרכז ולא בקצה.',
};

// Shown by the picker itself, in place of the normal help list, when a just
// picked '16:9' file cannot yield a crop at the floor above: said before the
// crop step ever opens, per the build brief, rather than after someone has
// already spent time framing a photo that was always going to be refused.
// Copy approved by `tora-hebrew-editor`.
export const PHOTO_TOO_SMALL_TO_CROP_ERROR = `התמונה קטנה מדי. צריך תמונה בגודל ${PLACE_PHOTO_MIN_WIDTH} על ${PLACE_PHOTO_MIN_HEIGHT} פיקסלים לפחות.`;

// The real upload states (rabbi-panel-copy.md, section 6): shown only when
// a caller passes `uploadStatus`, so the admin rabbi form (which never
// does) renders exactly as before.
export const PHOTO_UPLOADING_MESSAGE = 'מעלה את התמונה...';
export const PHOTO_UPLOAD_FAILED = 'העלאת התמונה לא הצליחה. התמונה הקודמת נשארה באתר.';
export const PHOTO_RETRY_LABEL = 'ניסיון נוסף';
export const PHOTO_CHOOSE_OTHER = 'בחירת תמונה אחרת';
export const PHOTO_MISSING_NOTE = 'עוד אין תמונה. בינתיים יוצג באתר רקע רך במקומה.';
// Kept identical to `RabbiFormPage/consts.ts`'s own pair: the same rejection
// reaches the person from either the picker or the form's own validation, and
// it must not read two ways depending on which caught it first.
export const UNSUPPORTED_TYPE_ERROR = 'אפשר להעלות קובץ JPG או PNG בלבד';
export const TOO_LARGE_ERROR = 'התמונה גדולה מ-5MB';
