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

// One line under the whole grid, not per tile (design gate fix round): the
// marked tiles (GalleryField.tsx's own ring) are the pointer, so this names
// them rather than repeating a size. Singular below the plural threshold,
// each referring to "the marked" photo or photos, matching the cover's own
// `COURSE_PHOTO_SMALL_WARNING` (`~/consts`) in everything but that: the
// gallery can hold several small photos where the cover is only ever one.
// Copy approved by `tora-hebrew-editor`.
export const gallerySmallPhotoWarning = (smallCount: number): string =>
  smallCount === 1
    ? 'התמונה המסומנת קטנה, ובאתר היא עלולה להיראות מטושטשת. אם יש גרסה גדולה יותר, כדאי להעלות אותה.'
    : 'התמונות המסומנות קטנות, ובאתר הן עלולות להיראות מטושטשות. אם יש גרסאות גדולות יותר, כדאי להעלות אותן.';
