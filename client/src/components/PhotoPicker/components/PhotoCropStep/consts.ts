// Draft copy, not finalised: wants `tora-hebrew-editor` (build brief for the
// crop step).
export const CROP_STEP_TITLE = 'חיתוך התמונה';
export const CROP_STEP_HINT = 'גרירה עם אצבע להזזה, צביטה או גלגלת עכבר להתקרבות ולהתרחקות.';
export const CROP_CONFIRM_LABEL = 'אישור החיתוך';
export const CROP_PROCESSING_LABEL = 'מעבד...';
export const CROP_CANCEL_LABEL = 'ביטול';

// The crop always ships as a JPEG regardless of the source file's own type,
// since it is redrawn from scratch onto a canvas: there is no original file
// left to preserve the type of.
export const CROP_OUTPUT_TYPE = 'image/jpeg';
export const CROP_OUTPUT_QUALITY = 0.92;
export const CROPPED_PHOTO_FILE_NAME = 'place-photo.jpg';

// A discrete zoom step per wheel notch, tuned to feel like a single pinch
// increment rather than jumping the frame on one scroll tick.
export const WHEEL_ZOOM_STEP = 0.08;
