import type { LessonTopic } from '@torabarabim/common';

import { COURSE_PHOTO_MIN_SIDE } from '~/consts';

import type { CourseFormField } from './models';

// `LESSON_TOPIC_LABELS`' own key order, minus `other`: that vocabulary
// carries no order of its own (a plain `Record`), so the chip row fixes one
// here rather than depending on `Object.keys` iteration order.
export const TOPIC_OPTIONS: Exclude<LessonTopic, 'other'>[] = ['gemara', 'halacha', 'parasha', 'mussar', 'chassidut', 'tanach', 'machshava'];

// The cover is a 3:4 portrait, like a rabbi's own poster: the server's
// floor is on the shorter side only (COURSE_PHOTO_MIN_SIDE), which for this
// ratio is the width, so the height floor is that same width scaled by 4/3.
export const COVER_MIN_WIDTH = COURSE_PHOTO_MIN_SIDE;
export const COVER_MIN_HEIGHT = Math.ceil((COURSE_PHOTO_MIN_SIDE * 4) / 3);

export const BACK_TO_LIST_LABEL = '→ חזרה לקורסים שלי';
export const NEW_HEADING = 'קורס חדש';
export const EDIT_HEADING = 'עריכת קורס';
export const ownershipNote = (rabbiName: string): string => `הקורס רשום על שמך ומופיע באתר תחת "${rabbiName}". כל השדות חובה, חוץ מהמצוינים כלא חובה.`;

export const ABOUT_SECTION_HEADING = 'על הקורס';
export const NAME_LABEL = 'שם הקורס';
export const DESCRIPTION_LABEL = 'תיאור הקורס';
export const TOPIC_LABEL = 'נושא הקורס (לא חובה)';
export const TOPIC_OTHER_LABEL = 'איזה נושא';
export const TOPIC_OTHER_OPTION_LABEL = 'אחר';
export const CYCLE_LABEL = 'מחזור (לא חובה)';

export const SCOPE_SECTION_HEADING = 'פתיחה והיקף';
export const OPENING_DATE_LABEL = 'תאריך פתיחה';
export const WEEKS_LABEL = 'מספר שבועות';
export const SESSIONS_LABEL = 'מספר מפגשים';
export const HOURS_LABEL = 'מספר שעות (לא חובה)';
export const JOINABLE_AFTER_OPENING_LABEL = 'אפשר להצטרף גם אחרי תאריך הפתיחה';

export const WHERE_SECTION_HEADING = 'איפה מתקיים הקורס';
export const AUDIENCE_SECTION_HEADING = 'למי הקורס מיועד';

export const PHOTOS_SECTION_HEADING = 'תמונות';
export const COVER_LABEL = 'תמונה ראשית';
export const GALLERY_AFTER_FIRST_SAVE_NOTE = 'אפשר להוסיף עוד תמונות אחרי השמירה הראשונה של הקורס.';

export const REGISTRATION_SECTION_HEADING = 'הרשמה';
export const CONTACT_PHONE_LABEL = 'טלפון ליצירת קשר';
export const PRICE_LABEL = 'מחיר בשקלים (לא חובה)';

export const LIVE_NOTE = 'מה שתשמרו כאן יופיע באתר מיד.';
export const SAVE_LABEL = 'שמירת הקורס';
export const SAVING_LABEL = 'שומרים...';
export const CANCEL_LABEL = 'ביטול';

export const ERROR_SUMMARY_HEADING = 'יש להשלים כמה שדות לפני השמירה:';
export const REQUIRED_NAME_ERROR = 'יש למלא שם קורס';
export const REQUIRED_DESCRIPTION_ERROR = 'יש למלא תיאור לקורס';
export const REQUIRED_TOPIC_OTHER_ERROR = 'יש למלא את נושא הקורס';
export const REQUIRED_COVER_ERROR = 'יש לבחור תמונה ראשית';
export const REQUIRED_OPENING_DATE_ERROR = 'יש לבחור תאריך פתיחה';
export const REQUIRED_WEEKS_ERROR = 'יש למלא מספר שבועות תקין';
export const REQUIRED_SESSIONS_ERROR = 'יש למלא מספר מפגשים תקין';
export const INVALID_HOURS_ERROR = 'מספר השעות לא תקין';
export const INVALID_CYCLE_ERROR = 'מספר המחזור לא תקין';
export const INVALID_PRICE_ERROR = 'המחיר לא תקין';
export const REQUIRED_CONTACT_PHONE_ERROR = 'יש למלא טלפון ליצירת קשר';
export const REQUIRED_AUDIENCE_ERROR = 'יש לבחור קהל יעד';

export const LOADING_MESSAGE = 'טוען...';
export const LOAD_ERROR_MESSAGE = 'לא הצלחנו לטעון את הקורס';
export const RETRY_LABEL = 'ניסיון נוסף';

export const DANGER_ZONE_HEADING = 'פעולות על הקורס';
export const MARK_FULL_LABEL = 'סימון תפוסה מלאה';
export const CLOSE_REGISTRATION_LABEL = 'סגירת ההרשמה';
export const DUPLICATE_LABEL = 'שכפול הקורס';
export const DELETE_LABEL = 'מחיקת הקורס';

export const SECTION_DEFS: { fields: CourseFormField[]; heading: string }[] = [
  { fields: ['name', 'description', 'topicOther', 'cycle'], heading: ABOUT_SECTION_HEADING },
  { fields: ['openingDate', 'weeks', 'sessions', 'hours'], heading: SCOPE_SECTION_HEADING },
  { fields: ['city', 'addressName', 'street'], heading: WHERE_SECTION_HEADING },
  { fields: ['audience'], heading: AUDIENCE_SECTION_HEADING },
  { fields: ['cover'], heading: PHOTOS_SECTION_HEADING },
  { fields: ['contactPhone', 'priceShekels'], heading: REGISTRATION_SECTION_HEADING },
];
