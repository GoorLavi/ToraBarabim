import type { LessonTopic } from '@torabarabim/common';

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
export const WEEKS_HELP = 'אחרי השבוע האחרון הקורס יורד מעצמו מהרשימות באתר.';
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
export const GALLERY_FIELD_LABEL = 'תמונות נוספות';
export const GALLERY_FIELD_HELP = 'לא חובה. אפשר להוסיף עד 8 תמונות, והן יופיעו בעמוד הקורס.';

export const REGISTRATION_SECTION_HEADING = 'הרשמה';
export const CONTACT_PHONE_LABEL = 'מספר טלפון ליצירת קשר';
export const CONTACT_PHONE_HELP = 'המספר יופיע בעמוד הקורס, וכל מי שנכנס יוכל לשלוח הודעה בוואטסאפ או להתקשר.';
export const PRICE_LABEL = 'מחיר';
export const PRICE_HELP = 'לא חובה. המחיר לכל הקורס, בשקלים.';

export const ERROR_SUMMARY_HEADING = 'יש להשלים כמה שדות לפני השמירה:';
export const REQUIRED_NAME_ERROR = 'יש למלא את שם הקורס';
export const REQUIRED_DESCRIPTION_ERROR = 'יש למלא תיאור';
export const REQUIRED_TOPIC_OTHER_ERROR = 'יש למלא את נושא הקורס';
export const REQUIRED_COVER_ERROR = 'יש להעלות תמונה ראשית';
export const REQUIRED_OPENING_DATE_ERROR = 'יש לבחור תאריך פתיחה';
export const REQUIRED_WEEKS_ERROR = 'יש למלא מספר שבועות';
export const REQUIRED_SESSIONS_ERROR = 'יש למלא מספר מפגשים';
export const REQUIRED_CONTACT_PHONE_ERROR = 'יש למלא מספר טלפון תקין';
export const REQUIRED_AUDIENCE_ERROR = 'יש לבחור קהל יעד';
// Zero is refused, not just negative or non-numeric: a price of zero would
// read as a free course, which the owner never wants a blank field to mean
// (server/src/service/course/consts.ts carries the same floor).
export const INVALID_PRICE_ERROR = 'המחיר חייב להיות לפחות 1 ₪. כדי לא להציג מחיר, משאירים ריק.';

export const SECTION_DEFS: { fields: CourseFormField[]; heading: string }[] = [
  { fields: ['name', 'description', 'topicOther'], heading: ABOUT_SECTION_HEADING },
  { fields: ['openingDate', 'weeks', 'sessions'], heading: SCOPE_SECTION_HEADING },
  { fields: ['city', 'addressName', 'street'], heading: WHERE_SECTION_HEADING },
  { fields: ['audience'], heading: AUDIENCE_SECTION_HEADING },
  { fields: ['cover'], heading: PHOTOS_SECTION_HEADING },
  { fields: ['contactPhone', 'priceShekels'], heading: REGISTRATION_SECTION_HEADING },
];
