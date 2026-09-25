import type { PhotoPickerAspectRatio } from './models';

// Hand-mirrored from `server/src/service/place/consts.ts`'s
// `PLACE_PHOTO_MIN_WIDTH` / `PLACE_PHOTO_MIN_HEIGHT`: no shared import path
// to the server's own values (`@torabarabim/common` is types only), so this
// is a separate copy naming its source. The server's own ratio band (1.5 to
// 2.0) has no client mirror any more: the crop step below always produces an
// exact 16:9 crop, which clears that band by construction, so there is
// nothing left for a client-side ratio check or a ratio line in the help
// text to do. Read by every '16:9' caller and passed to `PhotoPicker` as its
// `minWidth`/`minHeight` props, rather than assumed inside the component.
export const PLACE_PHOTO_MIN_WIDTH = 800;
export const PLACE_PHOTO_MIN_HEIGHT = 450;

// The design doc's own stated minimum for a rabbi's portrait
// (design-system.md, "The poster image"). Unlike the place pair above, this
// has no server-side check to mirror: the poster is cropped on display with
// no in-browser tool (helpers.ts, `ASPECT_RATIO_VALUE`), so nothing on the
// server ever measures the source file against it.
export const RABBI_PHOTO_MIN_WIDTH = 900;
export const RABBI_PHOTO_MIN_HEIGHT = 1200;

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

// The one place a ratio variant becomes the number the crop math (and
// `PhotoCropStep`, which knows nothing of '3:4'/'16:9' as concepts) actually
// needs. '3:4' never reaches the crop step today (only '16:9' does,
// `PhotoPicker.tsx`), but it still needs a real ratio for `aspect-ratio` on
// its own frame (styles.ts reads the CSS value directly, not through this
// map, since a CSS rule cannot import a TypeScript constant; this is the
// script-side mirror of the same two numbers).
export const ASPECT_RATIO_VALUE: Record<PhotoPickerAspectRatio, number> = {
  '3:4': 3 / 4,
  '16:9': 16 / 9,
};

// One noun for one thing across all three buttons: the field is called
// "התמונה שלי" in the panel, so "קובץ" is kept only for the lines that are
// actually about the file format.
export const PHOTO_CHOOSE_LABEL = 'בחירת תמונה';
export const PHOTO_REPLACE_LABEL = 'החלפת תמונה';
export const PHOTO_HELP_TYPE = 'JPG או PNG, עד 5MB';

// '3:4' only: the poster is cropped on display with no in-browser tool, so
// the reader needs to know to keep the face away from the edge. '16:9' had
// the same kind of line for the same reason (an accepted photo could still
// lose its sides on display), but the crop step now produces exactly the
// ratio the hero displays at, so nothing is cropped a second time and the
// line no longer applies; removed rather than kept beside the new '16:9'
// help text (helpers.ts, `photoHelpSize`).
export const PHOTO_HELP_CROP: Partial<Record<PhotoPickerAspectRatio, string>> = {
  '3:4': 'בכרטיס באתר התמונה נחתכת ליחס 3:4, לכן כדאי שהפנים יהיו במרכז ולא בקצה.',
};

// The real upload states (rabbi-panel-copy.md, section 6): shown only when
// a caller passes `uploadStatus`, so the admin rabbi form (which never
// does) renders exactly as before.
export const PHOTO_UPLOADING_MESSAGE = 'מעלים את התמונה...';
// The second sentence only applies once a previous photo exists to have
// stayed on the site; a caller with none (a course being created) passes
// `hasPreviousPhotoOnFailure={false}` to drop it.
export const PHOTO_UPLOAD_FAILED = 'העלאת התמונה לא הצליחה.';
export const PHOTO_UPLOAD_FAILED_PREVIOUS_KEPT = 'העלאת התמונה לא הצליחה. התמונה הקודמת נשארה באתר.';
export const PHOTO_RETRY_LABEL = 'ניסיון נוסף';
export const PHOTO_CHOOSE_OTHER = 'בחירת תמונה אחרת';
export const PHOTO_MISSING_NOTE = 'עוד אין תמונה. בינתיים יוצג באתר רקע רך במקומה.';
// Kept identical to `RabbiFormPage/consts.ts`'s own pair: the same rejection
// reaches the person from either the picker or the form's own validation, and
// it must not read two ways depending on which caught it first.
export const UNSUPPORTED_TYPE_ERROR = 'אפשר להעלות קובץ JPG או PNG בלבד';
export const TOO_LARGE_ERROR = 'התמונה גדולה מ-5MB';
