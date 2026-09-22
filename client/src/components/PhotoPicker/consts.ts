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
  '16:9': `תמונה לרוחב, לפחות ${PLACE_PHOTO_MIN_WIDTH} על ${PLACE_PHOTO_MIN_HEIGHT} פיקסלים, והרוחב גדול פי ${PLACE_PHOTO_MIN_ASPECT_RATIO} עד ${PLACE_PHOTO_MAX_ASPECT_RATIO} מהגובה. תמונה שצולמה לאורך לא תתאים, ותמונה שלא עומדת בדרישות נדחית ולא נחתכת אוטומטית.`,
};

// The card is where the crop happens, not the reason for it, so it leads the
// sentence and the recommendation follows. '16:9' has no entry: a place's
// photo is validated and rejected, never cropped, so there is no post-crop
// framing note to show for it.
export const PHOTO_HELP_CROP: Partial<Record<PhotoPickerAspectRatio, string>> = {
  '3:4': 'בכרטיס באתר התמונה נחתכת ליחס 3:4, לכן כדאי שהפנים יהיו במרכז ולא בקצה.',
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
