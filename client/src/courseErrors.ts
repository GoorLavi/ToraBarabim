import type { CourseErrorBody, CourseErrorCode } from '@torabarabim/common';

import { REQUIRED_COVER_ERROR } from '~/components/CourseFormFields/consts';
import { COURSE_GALLERY_MAX_PHOTOS } from '~/components/GalleryField/consts';
import { UNSUPPORTED_TYPE_ERROR } from '~/components/PhotoPicker/consts';
import { AUDIENCE_LABELS, COURSE_COVER_MIN_HEIGHT, COURSE_COVER_MIN_WIDTH, COURSE_GALLERY_PHOTO_MIN_SIDE } from '~/consts';
import { israelDayMonthLabel } from '~/helpers';

// A builder per `CourseErrorBody` member, each receiving exactly that
// code's own `details` shape (the mapped type below extracts it): a code
// added to the union without a builder here is a compile error, never a
// silently generic line.
type CourseErrorMessageBuilders = {
  [Code in CourseErrorCode]: (details: Extract<CourseErrorBody, { error: Code }>['details']) => string;
};

// "900 על 1200", never "900x1200" (mirrors `PhotoPicker/helpers.ts`'s own
// `photoHelpSize`): a multiplication sign between two numbers is
// bidi-neutral and renders reversed to anyone reading it as a Latin unit.
const dimensionsLabel = (width: number, height: number): string => `${width} על ${height}`;

// `client/CLAUDE.md` forbids rendering a raw server message. These specific
// course error codes are the one approved exception to the usual
// status-based mapping: the wording below is copied character for character
// from `.claude/plans/courses-spec.md` section 13, "User-facing server
// errors" (the owner's own approved wording, final). The course name is
// never quoted (the editor's own ruling) and stays plain inline text, since
// every current caller is a plain-string surface (a sheet's or a form's own
// error banner, the gallery's failed tile); a surface that can render
// markup would set it in bold inside `<bdi>` instead, but none of today's
// callers do.
const COURSE_ERROR_MESSAGES: CourseErrorMessageBuilders = {
  course_closed: ({ courseName, reason }) =>
    reason === 'full'
      ? `אפשר לערוך רק קורס שההרשמה אליו פתוחה. הקורס ${courseName} סומן "תפוסה מלאה".`
      : `אפשר לערוך רק קורס שההרשמה אליו פתוחה. ההרשמה לקורס ${courseName} כבר נסגרה.`,
  course_not_closed: ({ courseName }) =>
    `אפשר לשכפל רק קורס שההרשמה אליו נסגרה או שסומן "תפוסה מלאה". ההרשמה לקורס ${courseName} עדיין פתוחה.`,
  course_would_be_closed: ({ openingDate }) =>
    `צריך תאריך פתיחה שעוד לא הגיע, או לאפשר להצטרף גם אחרי הפתיחה. התאריך ${israelDayMonthLabel(openingDate)} כבר הגיע, וההרשמה הייתה נסגרת מיד.`,
  opening_date_not_future: ({ openingDate }) => `לקורס החדש צריך תאריך פתיחה שעוד לא הגיע. התאריך שנבחר הוא ${israelDayMonthLabel(openingDate)}.`,
  photo_too_small: (details) =>
    details.kind === 'gallery'
      ? `התמונה קטנה מדי. הצד הקצר שלה צריך להיות לפחות ${COURSE_GALLERY_PHOTO_MIN_SIDE} פיקסלים, ובתמונה הזאת הוא ${details.measuredShorterSide}.`
      : `התמונה קטנה מדי. צריך תמונה בגודל ${dimensionsLabel(COURSE_COVER_MIN_WIDTH, COURSE_COVER_MIN_HEIGHT)} פיקסלים לפחות, והתמונה הזאת ${dimensionsLabel(details.measuredWidth, details.measuredHeight)}.`,
  course_photo_limit: () => `אפשר להוסיף עד ${COURSE_GALLERY_MAX_PHOTOS} תמונות. כדי להוסיף עוד אחת, צריך קודם להסיר תמונה.`,
  cover_required: () => REQUIRED_COVER_ERROR,
  rabbanit_audience_must_be_women: ({ audience }) => `בקורס של רבנית הקהל הוא נשים. בטופס נבחר "${AUDIENCE_LABELS[audience]}".`,
  unsupported_file_type: () => UNSUPPORTED_TYPE_ERROR,
};

export const isCourseErrorCode = (code: string | undefined): code is CourseErrorCode =>
  Object.prototype.hasOwnProperty.call(COURSE_ERROR_MESSAGES, code as string);

// `details` arrives as `unknown` off the wire (the two panels' own
// `ApiError` classes carry it unnarrowed, since they cover every endpoint,
// not just these). The cast here is the one place that trusts it: the
// server only ever sends this shape for a code in `CourseErrorBody`, which
// `isCourseErrorCode` has already confirmed before a caller reaches this
// function.
export const courseErrorMessage = (code: CourseErrorCode, details: unknown): string => {
  const build = COURSE_ERROR_MESSAGES[code] as (details: unknown) => string;
  return build(details);
};
