import type { CloseReason, LessonAudience } from '@torabarabim/common';

// A course stays listed for a week after registration closes (by the
// calendar, by hand, or marked full), then leaves every list but keeps its
// own page. Confirmed by the owner: "קורס יורד שבוע אחרי שההרשמה נסגרה".
export const CLOSED_WEEK_DAYS = 7;

export const COURSE_GALLERY_MAX_PHOTOS = 8;

// The floor on the shorter side, for the cover and every gallery photo. The
// widest rail tier is 296 CSS px, 592 device px at 2x; a higher floor would
// refuse WhatsApp-compressed flyers after the square crop. Hand-mirrored in
// the client (`client/src/consts.ts`).
export const COURSE_PHOTO_MIN_SIDE = 600;

export const COURSE_NAME_MAX_LENGTH = 120;
export const COURSE_DESCRIPTION_MAX_LENGTH = 4000;
export const COURSE_TEACHER_NAME_MAX_LENGTH = 120;
export const COURSE_TOPIC_OTHER_MAX_LENGTH = 120;

export const COURSE_WEEKS_MIN = 1;
export const COURSE_WEEKS_MAX = 104;
export const COURSE_SESSIONS_MIN = 1;
export const COURSE_SESSIONS_MAX = 500;
export const COURSE_HOURS_MIN = 1;
export const COURSE_HOURS_MAX = 2000;
export const COURSE_CYCLE_MIN = 1;
export const COURSE_CYCLE_MAX = 999;

// Never 0: a price of zero would read as a free course, which the owner
// explicitly refused ("גם אם רושמים 0 שקל אל תרשום קורס חינם").
export const COURSE_PRICE_MIN = 1;
export const COURSE_PRICE_MAX = 100_000;

export const DEFAULT_COURSE_PAGE = 1;
export const DEFAULT_COURSE_PAGE_SIZE = 20;
export const MAX_COURSE_PAGE_SIZE = 50;

// Every user-facing message below is the owner-approved wording from
// `courses-spec.md` section 13 ("User-facing server errors"), verbatim,
// with its placeholders filled. Kept here, not hand-built per route, so the
// rabbi panel and the admin panel can never disagree on the same error.

const HEBREW_MONTH_NAMES = [
  'בינואר', 'בפברואר', 'במרץ', 'באפריל', 'במאי', 'ביוני',
  'ביולי', 'באוגוסט', 'בספטמבר', 'באוקטובר', 'בנובמבר', 'בדצמבר',
] as const;

// Formats an ISO date's own calendar day and month, with no timezone
// conversion: a date-only string names a day, not an instant, so reading it
// through a `Date`/`Intl` pair (which needs a timezone to render one) would
// risk shifting the day for no reason. Reads "3 בנובמבר".
const formatHebrewDayMonth = (isoDate: string): string => {
  const [, month, day] = isoDate.split('-');
  const monthName = HEBREW_MONTH_NAMES[Number(month) - 1];
  return `${Number(day)} ${monthName}`;
};

export const courseClosedMessage = (courseName: string, reason: CloseReason): string =>
  reason === 'full'
    ? `אפשר לערוך רק קורס שההרשמה אליו פתוחה. הקורס ${courseName} סומן "תפוסה מלאה".`
    : `אפשר לערוך רק קורס שההרשמה אליו פתוחה. ההרשמה לקורס ${courseName} כבר נסגרה.`;

export const courseNotClosedMessage = (courseName: string): string =>
  `אפשר לשכפל רק קורס שההרשמה אליו נסגרה או שסומן "תפוסה מלאה". ההרשמה לקורס ${courseName} עדיין פתוחה.`;

export const courseWouldBeClosedMessage = (openingDate: string): string =>
  `צריך תאריך פתיחה שעוד לא הגיע, או לסמן "אפשר להצטרף גם אחרי הפתיחה". התאריך ${formatHebrewDayMonth(openingDate)} כבר הגיע, וההרשמה הייתה נסגרת מיד.`;

export const openingDateNotFutureMessage = (openingDate: string): string =>
  `לקורס החדש צריך תאריך פתיחה שעוד לא הגיע. התאריך שנבחר הוא ${formatHebrewDayMonth(openingDate)}.`;

export const coursePhotoTooSmallMessage = (shortestSide: number): string =>
  `התמונה קטנה מדי. הצד הקצר שלה צריך להיות לפחות ${COURSE_PHOTO_MIN_SIDE} פיקסלים, ובתמונה הזאת הוא ${shortestSide}.`;

const AUDIENCE_LABELS_HE: Record<LessonAudience, string> = {
  men: 'גברים',
  women: 'נשים',
  mixed: 'גם גברים וגם נשים',
};

export const courseRabbanitAudienceMessage = (audience: LessonAudience): string =>
  `בקורס של רבנית הקהל הוא נשים. בטופס נבחר "${AUDIENCE_LABELS_HE[audience]}".`;
