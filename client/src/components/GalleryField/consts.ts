// Hand-mirrored by name from server/src/service/course/consts.ts (409
// `course_photo_limit` is the server's own enforcement, RabbiPanel/api.ts's
// `uploadCoursePhoto`): mirrored here so the tile grid can stop offering the
// add-tile before that request ever fires.
export const COURSE_GALLERY_MAX_PHOTOS = 8;

export const galleryCountLabel = (count: number): string => `${count} מתוך ${COURSE_GALLERY_MAX_PHOTOS}`;
export const GALLERY_ADD_LABEL = 'הוספת תמונות';
export const GALLERY_UPLOADING_LABEL = 'מעלים...';
export const GALLERY_UPLOAD_FAILED_LABEL = 'ההעלאה לא הצליחה.';
// The gallery calls this action הסרה everywhere (the tile's own remove
// button, the field's aria-label), so its own failure reads the same way.
export const GALLERY_REMOVE_FAILED_LABEL = 'ההסרה לא הצליחה.';
export const GALLERY_RETRY_LABEL = 'ניסיון נוסף';
export const galleryRemoveLabel = (position: number): string => `הסרת תמונה ${position}`;
export const GALLERY_MAX_REACHED_NOTE = `אפשר להוסיף עד ${COURSE_GALLERY_MAX_PHOTOS} תמונות. כדי להוסיף עוד אחת, צריך קודם להסיר תמונה.`;
