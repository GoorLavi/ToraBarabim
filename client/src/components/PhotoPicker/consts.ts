// One noun for one thing across all three buttons: the field is called
// "התמונה שלי" in the panel, so "קובץ" is kept only for the lines that are
// actually about the file format.
export const PHOTO_CHOOSE_LABEL = 'בחירת תמונה';
export const PHOTO_REPLACE_LABEL = 'החלפת תמונה';
export const PHOTO_HELP_TYPE = 'JPG או PNG, עד 5MB';
// Dimensions read as "900 על 1200", never "900x1200": a multiplication sign
// between two numbers is bidi-neutral, inherits the paragraph's direction,
// and renders the pair reversed to anyone reading it as a Latin unit.
export const PHOTO_HELP_SIZE = 'לפחות 900 על 1200 פיקסלים';
// The card is where the crop happens, not the reason for it, so it leads the
// sentence and the recommendation follows.
export const PHOTO_HELP_CROP = 'בכרטיס באתר התמונה נחתכת ליחס 3:4, לכן כדאי שהפנים יהיו במרכז ולא בקצה.';

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
