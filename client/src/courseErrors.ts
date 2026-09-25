import type { CloseReason, LessonAudience } from '@torabarabim/common';

import { REQUIRED_COVER_ERROR } from '~/components/CourseFormFields/consts';
import { COURSE_GALLERY_MAX_PHOTOS } from '~/components/GalleryField/consts';
import { UNSUPPORTED_TYPE_ERROR } from '~/components/PhotoPicker/consts';
import { AUDIENCE_LABELS, COURSE_COVER_MIN_HEIGHT, COURSE_COVER_MIN_WIDTH, COURSE_GALLERY_PHOTO_MIN_SIDE } from '~/consts';
import { israelDayMonthLabel } from '~/helpers';

// `client/CLAUDE.md` forbids rendering a raw server message. These specific
// course error codes are the one approved exception to the usual
// status-based mapping: the wording below is copied character for character
// from `.claude/plans/courses-spec.md` section 13, "User-facing server
// errors" (the owner's own approved wording, final), with only the
// placeholders it names filled in. The server sends structured `details`
// for each, matching the shapes in commit 23dfc45, read by both panels'
// forms, their four confirm sheets and the gallery's failed tile.
//
// TODO(common exports a typed union for these bodies): once
// `common/src/course.ts` has one, read `details` through it directly
// instead of `asRecord`/`asString`/`asNumber` below, so a renamed field is
// a compile error here rather than a silently generic line.
export const COURSE_ERROR_CODES = [
  'course_closed',
  'course_not_closed',
  'course_would_be_closed',
  'opening_date_not_future',
  'photo_too_small',
  'course_photo_limit',
  'cover_required',
  'rabbanit_audience_must_be_women',
  'unsupported_file_type',
] as const;

export type CourseErrorCode = (typeof COURSE_ERROR_CODES)[number];

export const isCourseErrorCode = (code: string | undefined): code is CourseErrorCode =>
  COURSE_ERROR_CODES.includes(code as CourseErrorCode);

// A network failure (status 0) is the only one worth retrying: every other
// course error code above is a rejection that will fail again unchanged.
export const isRetryableCourseError = (status: number): boolean => status === 0;

const asRecord = (value: unknown): Record<string, unknown> => (value !== null && typeof value === 'object' ? (value as Record<string, unknown>) : {});
const asString = (value: unknown): string | undefined => (typeof value === 'string' ? value : undefined);
const asNumber = (value: unknown): number | undefined => (typeof value === 'number' ? value : undefined);

// "900 על 1200", never "900x1200" (mirrors `PhotoPicker/helpers.ts`'s own
// `photoHelpSize`): a multiplication sign between two numbers is
// bidi-neutral and renders reversed to anyone reading it as a Latin unit.
const dimensionsLabel = (width: number, height: number): string => `${width} על ${height}`;

// The course name is never quoted (the editor's own ruling): plain inline
// text here, since every current caller of this function is a plain-string
// surface (a sheet's or a form's own error banner, the gallery's failed
// tile). A surface that can render markup would set it in bold inside
// `<bdi>` instead; none of today's callers do.
export const courseErrorMessage = (code: CourseErrorCode, details: unknown): string => {
  const record = asRecord(details);

  switch (code) {
    case 'course_closed': {
      const courseName = asString(record.courseName) ?? '';
      const reason = record.reason as CloseReason | undefined;
      return reason === 'full'
        ? `אפשר לערוך רק קורס שההרשמה אליו פתוחה. הקורס ${courseName} סומן "תפוסה מלאה".`
        : `אפשר לערוך רק קורס שההרשמה אליו פתוחה. ההרשמה לקורס ${courseName} כבר נסגרה.`;
    }
    case 'course_not_closed': {
      const courseName = asString(record.courseName) ?? '';
      return `אפשר לשכפל רק קורס שההרשמה אליו נסגרה או שסומן "תפוסה מלאה". ההרשמה לקורס ${courseName} עדיין פתוחה.`;
    }
    case 'course_would_be_closed': {
      const openingDate = asString(record.openingDate);
      const dateLabel = openingDate ? israelDayMonthLabel(openingDate) : '';
      return `צריך תאריך פתיחה שעוד לא הגיע, או לאפשר להצטרף גם אחרי הפתיחה. התאריך ${dateLabel} כבר הגיע, וההרשמה הייתה נסגרת מיד.`;
    }
    case 'opening_date_not_future': {
      const openingDate = asString(record.openingDate);
      const dateLabel = openingDate ? israelDayMonthLabel(openingDate) : '';
      return `לקורס החדש צריך תאריך פתיחה שעוד לא הגיע. התאריך שנבחר הוא ${dateLabel}.`;
    }
    case 'photo_too_small': {
      if (record.kind === 'gallery') {
        const measured = asNumber(record.measuredShorterSide) ?? COURSE_GALLERY_PHOTO_MIN_SIDE;
        return `התמונה קטנה מדי. הצד הקצר שלה צריך להיות לפחות ${COURSE_GALLERY_PHOTO_MIN_SIDE} פיקסלים, ובתמונה הזאת הוא ${measured}.`;
      }
      const measuredWidth = asNumber(record.measuredWidth) ?? COURSE_COVER_MIN_WIDTH;
      const measuredHeight = asNumber(record.measuredHeight) ?? COURSE_COVER_MIN_HEIGHT;
      return `התמונה קטנה מדי. צריך תמונה בגודל ${dimensionsLabel(COURSE_COVER_MIN_WIDTH, COURSE_COVER_MIN_HEIGHT)} פיקסלים לפחות, והתמונה הזאת ${dimensionsLabel(measuredWidth, measuredHeight)}.`;
    }
    case 'course_photo_limit':
      return `אפשר להוסיף עד ${COURSE_GALLERY_MAX_PHOTOS} תמונות. כדי להוסיף עוד אחת, צריך קודם להסיר תמונה.`;
    case 'cover_required':
      return REQUIRED_COVER_ERROR;
    case 'rabbanit_audience_must_be_women': {
      const audience = asString(record.audience) as LessonAudience | undefined;
      const audienceLabel = audience ? AUDIENCE_LABELS[audience] : '';
      return `בקורס של רבנית הקהל הוא נשים. בטופס נבחר "${audienceLabel}".`;
    }
    case 'unsupported_file_type':
      return UNSUPPORTED_TYPE_ERROR;
  }
};
