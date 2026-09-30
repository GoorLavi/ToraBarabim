import type { LessonTopic } from '@torabarabim/common';

import { COURSE_GALLERY_MAX_PHOTOS } from '~/components/GalleryField/consts';
import { COURSE_COVER_SOFT_MIN_HEIGHT, COURSE_COVER_SOFT_MIN_WIDTH } from '~/consts';
import { formatNumber } from '~/helpers';

import type { CourseFormField } from './models';

// `LESSON_TOPIC_LABELS`' own key order, minus `other`: that vocabulary
// carries no order of its own (a plain `Record`), so the chip row fixes one
// here rather than depending on `Object.keys` iteration order.
export const TOPIC_OPTIONS: Exclude<LessonTopic, 'other'>[] = ['gemara', 'halacha', 'parasha', 'mussar', 'chassidut', 'tanach', 'machshava'];

export const ABOUT_SECTION_HEADING = 'על הקורס';
export const NAME_LABEL = 'שם הקורס';
export const DESCRIPTION_LABEL = 'תיאור';
export const DESCRIPTION_HELP = 'כמה שורות על מה שילמדו בקורס ולמי הוא מתאים.';
export const TOPIC_LABEL = 'נושא';
export const TOPIC_HELP = 'לא חובה.';
export const TOPIC_NONE_OPTION_LABEL = 'בלי נושא';
export const TOPIC_OTHER_OPTION_LABEL = 'אחר';
export const TOPIC_OTHER_LABEL = 'נושא אחר';
export const CYCLE_LABEL = 'מחזור';
export const CYCLE_HELP = 'לא חובה.';

export const SCOPE_SECTION_HEADING = 'פתיחה והיקף';
export const OPENING_DATE_LABEL = 'תאריך פתיחה';
export const WEEKS_LABEL = 'מספר שבועות';
export const SESSIONS_LABEL = 'מספר מפגשים';
export const HOURS_LABEL = 'מספר שעות';
export const HOURS_HELP = 'לא חובה. סך כל שעות הלימוד בקורס.';
export const JOINABLE_AFTER_OPENING_LABEL = 'אפשר להצטרף גם אחרי הפתיחה?';
export const JOINABLE_AFTER_OPENING_HELP = 'אם כן, הקורס יישאר בעמוד הבית גם אחרי הפתיחה.';
export const JOINABLE_NO_LABEL = 'לא';
export const JOINABLE_YES_LABEL = 'כן';

export const WHERE_SECTION_HEADING = 'איפה מתקיים הקורס';
export const AUDIENCE_SECTION_HEADING = 'למי הקורס מיועד';

export const PHOTOS_SECTION_HEADING = 'תמונות';
export const COVER_LABEL = 'תמונה ראשית';
export const COVER_CROP_HELP = 'בכרטיס באתר התמונה נחתכת ליחס 3:4 (לאורך), ולכן כדאי שהעיקר יהיה במרכז ולא בקצוות.';
// Replaces `PhotoPicker/helpers.ts`'s own "לפחות W על H פיקסלים" line: the
// site does not refuse a smaller cover any more (`~/consts`,
// `COURSE_PHOTO_SMALL_WARNING`), so its help line reads as a
// recommendation rather than a requirement. Built from the same soft
// thresholds the warning itself compares against, never a second, hand-typed
// copy of the two numbers.
export const COVER_SIZE_HELP = `מומלץ לפחות ${COURSE_COVER_SOFT_MIN_WIDTH} על ${COURSE_COVER_SOFT_MIN_HEIGHT} פיקסלים`;
// A course cannot be saved without a cover (REQUIRED_COVER_ERROR below), so
// its empty state has no "meanwhile a soft background shows" to promise.
export const COVER_MISSING_NOTE = 'עוד אין תמונה.';
export const GALLERY_FIELD_LABEL = 'תמונות נוספות';
export const GALLERY_FIELD_HELP = `לא חובה. אפשר להוסיף עד ${COURSE_GALLERY_MAX_PHOTOS} תמונות, והן יופיעו בעמוד הקורס.`;

export const REGISTRATION_SECTION_HEADING = 'הרשמה';
export const CONTACT_PHONE_LABEL = 'מספר טלפון ליצירת קשר';
export const CONTACT_PHONE_HELP = 'המספר יופיע בעמוד הקורס, וכל מי שנכנס יוכל לשלוח הודעה בוואטסאפ או להתקשר.';
export const PRICE_LABEL = 'מחיר';
export const PRICE_HELP = 'לא חובה. המחיר לכל הקורס, בשקלים.';
export const PRICE_CURRENCY_SYMBOL = '₪';

export const ERROR_SUMMARY_HEADING = 'יש להשלים לפני השמירה:';
export const REQUIRED_NAME_ERROR = 'יש למלא את שם הקורס';
export const REQUIRED_DESCRIPTION_ERROR = 'יש למלא תיאור';
export const REQUIRED_TOPIC_OTHER_ERROR = 'יש למלא את נושא הקורס';
export const REQUIRED_COVER_ERROR = 'יש להעלות תמונה ראשית';
export const REQUIRED_OPENING_DATE_ERROR = 'יש לבחור תאריך פתיחה';
export const REQUIRED_WEEKS_ERROR = 'יש למלא מספר שבועות';
export const REQUIRED_SESSIONS_ERROR = 'יש למלא מספר מפגשים';
export const REQUIRED_CONTACT_PHONE_ERROR = 'יש למלא מספר נייד תקין, למשל 050-123-4567';
export const REQUIRED_AUDIENCE_ERROR = 'יש לבחור קהל יעד';
// Zero is refused, not just negative or non-numeric: a price of zero would
// read as a free course, which the owner never wants a blank field to mean
// (server/src/service/course/consts.ts carries the same floor).
export const INVALID_PRICE_ERROR = 'המחיר צריך להיות מספר שלם בשקלים, לפחות 1. כדי לא להציג מחיר, משאירים את השדה ריק.';

// Upper bounds mirrored from server/src/service/course/consts.ts.
export const COURSE_CYCLE_MAX = 999;
export const COURSE_WEEKS_MAX = 104;
export const COURSE_SESSIONS_MAX = 500;
export const COURSE_HOURS_MAX = 2000;
export const COURSE_PRICE_MAX = 100000;
export const COURSE_NAME_MAX_LENGTH = 120;
export const COURSE_DESCRIPTION_MAX_LENGTH = 4000;
export const COURSE_TOPIC_OTHER_MAX_LENGTH = 120;

// Each shown only once its own field is out of range (never in the field's
// normal help line, which stays as approved). Built from the bounds above
// through the site's own number formatter, so a four-digit bound always
// carries its thousands comma.
export const CYCLE_RANGE_ERROR = `מספר המחזור צריך להיות בין 1 ל־${formatNumber(COURSE_CYCLE_MAX)}`;
export const WEEKS_RANGE_ERROR = `מספר השבועות צריך להיות בין 1 ל־${formatNumber(COURSE_WEEKS_MAX)}`;
export const SESSIONS_RANGE_ERROR = `מספר המפגשים צריך להיות בין 1 ל־${formatNumber(COURSE_SESSIONS_MAX)}`;
export const HOURS_RANGE_ERROR = `מספר השעות צריך להיות בין 1 ל־${formatNumber(COURSE_HOURS_MAX)}, בלי שברים`;
export const PRICE_TOO_HIGH_ERROR = `המחיר יכול להיות עד ${formatNumber(COURSE_PRICE_MAX)} ₪`;
export const NAME_TOO_LONG_ERROR = `שם הקורס יכול להיות עד ${formatNumber(COURSE_NAME_MAX_LENGTH)} תווים`;
export const DESCRIPTION_TOO_LONG_ERROR = `התיאור יכול להיות עד ${formatNumber(COURSE_DESCRIPTION_MAX_LENGTH)} תווים`;
export const TOPIC_OTHER_TOO_LONG_ERROR = `נושא הקורס יכול להיות עד ${formatNumber(COURSE_TOPIC_OTHER_MAX_LENGTH)} תווים`;

export const SECTION_DEFS: { fields: CourseFormField[]; heading: string }[] = [
  { fields: ['name', 'description', 'topicOther', 'cycle'], heading: ABOUT_SECTION_HEADING },
  { fields: ['openingDate', 'weeks', 'sessions', 'hours'], heading: SCOPE_SECTION_HEADING },
  { fields: ['city', 'addressName', 'street'], heading: WHERE_SECTION_HEADING },
  { fields: ['audience'], heading: AUDIENCE_SECTION_HEADING },
  { fields: ['cover'], heading: PHOTOS_SECTION_HEADING },
  { fields: ['contactPhone', 'priceShekels'], heading: REGISTRATION_SECTION_HEADING },
];
