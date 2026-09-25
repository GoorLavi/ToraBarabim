import { COURSE_GALLERY_PHOTO_MIN_SIDE } from '~/consts';

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

// Shown when `helpers.ts`'s own `clearsGalleryFloor` rejects one or more
// just-picked files before they ever reach the upload request (mirrors the
// server's own `photo_too_small` rejection, `~/courseErrors.ts`). The
// rejected files are dropped and the rest are still added (GalleryField.tsx),
// so the line says so whenever at least one was: singular for exactly one
// accepted file, plural for several, and no addition sentence at all when
// every picked file was rejected.
export const galleryTooSmallError = (rejectedCount: number, acceptedCount: number): string => {
  const totalCount = rejectedCount + acceptedCount;
  const rejectionSentence =
    rejectedCount === 1
      ? totalCount === 1
        ? `התמונה קטנה מדי. הצד הקצר שלה צריך להיות לפחות ${COURSE_GALLERY_PHOTO_MIN_SIDE} פיקסלים.`
        : `תמונה אחת קטנה מדי. הצד הקצר שלה צריך להיות לפחות ${COURSE_GALLERY_PHOTO_MIN_SIDE} פיקסלים.`
      : `${rejectedCount} תמונות קטנות מדי. הצד הקצר של כל תמונה צריך להיות לפחות ${COURSE_GALLERY_PHOTO_MIN_SIDE} פיקסלים.`;

  if (acceptedCount === 0) return rejectionSentence;
  const additionSentence = acceptedCount === 1 ? 'התמונה האחרת נוספה.' : 'שאר התמונות נוספו.';
  return `${rejectionSentence} ${additionSentence}`;
};
