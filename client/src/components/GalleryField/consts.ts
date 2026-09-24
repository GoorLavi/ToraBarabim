// The cap the server itself enforces (409 `course_photo_limit`, RabbiPanel/api.ts's
// `uploadCoursePhoto`), mirrored here so the tile grid can stop offering the
// add-tile before that request ever fires.
export const COURSE_GALLERY_MAX_PHOTOS = 8;

export const GALLERY_HEADING = 'תמונות';
export const galleryCountLabel = (count: number): string => `${count} מתוך ${COURSE_GALLERY_MAX_PHOTOS}`;
export const GALLERY_HELP_LINE = `לא חובה. אפשר להוסיף עד ${COURSE_GALLERY_MAX_PHOTOS} תמונות, בנוסף לתמונה הראשית.`;
export const GALLERY_ADD_LABEL = 'הוספת תמונה';
export const GALLERY_UPLOADING_LABEL = 'מעלים...';
export const GALLERY_FAILED_LABEL = 'ההעלאה נכשלה';
export const GALLERY_RETRY_LABEL = 'ניסיון נוסף';
export const galleryRemoveLabel = (position: number): string => `הסרת תמונה ${position}`;
export const GALLERY_MAX_REACHED_NOTE = `הגעתם למספר התמונות המרבי. כדי להוסיף תמונה חדשה, קודם צריך להסיר אחת.`;
