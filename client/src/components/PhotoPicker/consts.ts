import type { PhotoPickerAspectRatio } from './models';

// Hand-mirrored from `server/src/service/place/consts.ts`'s
// `PLACE_PHOTO_MIN_WIDTH` / `PLACE_PHOTO_MIN_HEIGHT` /
// `PLACE_PHOTO_MIN_ASPECT_RATIO` / `PLACE_PHOTO_MAX_ASPECT_RATIO`: no shared
// import path to the server's own values (`@torabarabim/common` is types
// only), so this is a separate copy naming its source.
const PLACE_PHOTO_MIN_WIDTH = 1200;
const PLACE_PHOTO_MIN_HEIGHT = 675;
const PLACE_PHOTO_MIN_ASPECT_RATIO = 1.5;
const PLACE_PHOTO_MAX_ASPECT_RATIO = 2.0;

// The 16:9 frame otherwise takes the field's full width with no ceiling
// (styles.ts), which is right on a phone but renders at 776 wide (437 tall)
// in the 1280 profile form, pushing every field below it off the first
// screen (design gate finding B2). Larger than the 320 the photo actually
// ships at in the hero, so it still reads as a real preview; small enough
// that the form's fields stay above the fold at 1280.
export const PHOTO_PICKER_16X9_FRAME_MAX_WIDTH = 480;

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
// changes: '3:4' is every rabbi's portrait, '16:9' is a place's own photo,
// which has both a different floor and a validated ratio band rather than a
// single exact ratio.
// The '16:9' entry states the rejection up front, before the file dialog
// opens: unlike '3:4', a place's photo is validated and rejected outright
// rather than cropped to fit, so the person needs to know that before
// picking a file, not after.
export const PHOTO_HELP_SIZE: Record<PhotoPickerAspectRatio, string> = {
  '3:4': 'לפחות 900 על 1200 פיקסלים',
  '16:9': `תמונה לרוחב, לפחות ${PLACE_PHOTO_MIN_WIDTH} על ${PLACE_PHOTO_MIN_HEIGHT} פיקסלים, והרוחב גדול פי ${PLACE_PHOTO_MIN_ASPECT_RATIO} עד ${PLACE_PHOTO_MAX_ASPECT_RATIO} מהגובה. תמונה שצולמה לאורך לא תתאים, ותמונה שלא עומדת בדרישות נדחית בהעלאה ולא נחתכת אוטומטית.`,
};

// The card is where the crop happens, not the reason for it, so it leads the
// sentence and the recommendation follows. The two lines describe different
// stages of the same photo and would read as a contradiction without saying
// so: the size line above refuses a photo at upload, this one warns that an
// accepted photo is still cropped on display. Validation only rejects a
// ratio outside 1.5-2.0 (server/src/service/place/consts.ts) while the hero
// always displays at exactly 1.778 with `object-fit: cover`, so a photo that
// passes can still lose its sides. '16:9' carries no ratio number on purpose:
// the size line already expresses the same idea as a multiple, and a second
// notation for one concept is a number the reader cannot act on.
export const PHOTO_HELP_CROP: Partial<Record<PhotoPickerAspectRatio, string>> = {
  '3:4': 'בכרטיס באתר התמונה נחתכת ליחס 3:4, לכן כדאי שהפנים יהיו במרכז ולא בקצה.',
  '16:9': 'בכרטיס באתר הצדדים של התמונה עלולים להיחתך, לכן כדאי שמה שחשוב יהיה במרכז ולא בקצה.',
};

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
