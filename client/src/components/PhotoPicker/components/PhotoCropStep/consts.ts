// Split into three sentences, each exactly as `tora-hebrew-editor` approved
// it, so `CROP_STEP_HINT_WHEEL_NOTE` can hide below `md` (styles.ts, design
// gate round 6) without rewording anything.
export const CROP_STEP_TITLE = 'התאמת התמונה';
export const CROP_STEP_HINT_DRAG_AND_PINCH = 'גוררים את התמונה כדי להזיז אותה, וצובטים כדי להגדיל או להקטין.';
export const CROP_STEP_HINT_WHEEL_NOTE = 'במחשב גלגלת העכבר מגדילה ומקטינה.';
export const CROP_STEP_HINT_FRAME_DISCARD = 'מה שנשאר מחוץ למסגרת לא יופיע באתר.';
// Replaces the hint above when the photo is already exactly 16:9 with no
// zoom headroom, so dragging and pinching do nothing. It says there is
// nothing to move rather than that moving is not required: this line exists
// for the person whose finger already failed, and "not required" tells them
// they could have. It names a ratio, not a size, because that is what the
// condition tests. It also deliberately does not tell them to press the
// confirm button, which would put a second copy of `CROP_CONFIRM_LABEL` in
// this file and point at a label that no longer exists the day it changes.
export const CROP_STEP_HINT_NO_FRAMING_ROOM = 'התמונה כבר מתאימה למסגרת בדיוק, ואין מה להזיז או להגדיל.';
export const CROP_CONFIRM_LABEL = 'אישור';
export const CROP_PROCESSING_LABEL = 'מכינים...';
export const CROP_CANCEL_LABEL = 'ביטול';

// The frame's historical desktop cap (previously a raw 480px in styles.ts's
// `.viewport` rule): the frame is now sized in script from the stage's own
// measured area (helpers.ts), so this is its one home rather than a value
// duplicated between a CSS rule and a JS computation.
export const CROP_WINDOW_MAX_WIDTH_PX = 480;

// The crop always ships as a JPEG regardless of the source file's own type,
// since it is redrawn from scratch onto a canvas: there is no original file
// left to preserve the type of.
export const CROP_OUTPUT_TYPE = 'image/jpeg';
export const CROP_OUTPUT_QUALITY = 0.92;
export const CROPPED_PHOTO_FILE_NAME = 'place-photo.jpg';

// A discrete zoom step per wheel notch, tuned to feel like a single pinch
// increment rather than jumping the frame on one scroll tick.
export const WHEEL_ZOOM_STEP = 0.08;
