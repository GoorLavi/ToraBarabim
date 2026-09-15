import type { RabbiHonorific } from '@torabarabim/common';

export const HEADING = 'הפרטים שלי';

// Keyed by the signed-in rabbi's own honorific: the panel is loading (and
// showing the loading skeleton) until it knows which form to use, so this
// never has to fall back to a gender-neutral phrasing of its own.
export const SUBTEXT: Record<RabbiHonorific, string> = {
  rav: 'כך אתה מופיע באתר, בכרטיס ובעמוד שלך.',
  rabbanit: 'כך את מופיעה באתר, בכרטיס ובעמוד שלך.',
};

export const PHOTO_LABEL = 'התמונה שלי';

// Read-only: the honorific is an admin-only setting (see `RabbiFormPage`),
// never sent on `UpdateRabbiProfileRequest` (common/src/rabbi-portal.ts).
export const HONORIFIC_LABEL = 'הרב או הרבנית';
export const HONORIFIC_READONLY_NOTE = 'נקבע על ידי הצוות שלנו. פנו אלינו אם צריך לשנות.';

export const NAME_LABEL = 'השם שלי';
export const NAME_HELPER = 'השם בלבד, בלי "הרב" או "הרבנית". הפנייה נוספת אוטומטית.';
export const REQUIRED_NAME_ERROR = 'יש למלא שם';

export const TITLE_LABEL = 'תואר';
export const TITLE_PLACEHOLDER = 'למשל: רב בית הכנסת אהל יוסף';
export const TITLE_HELPER = 'לא חובה. מופיע בשורה קטנה מתחת לשם.';

export const BIO_LABEL = 'קצת עליי';
export const BIO_HELPER: Record<RabbiHonorific, string> = {
  rav: 'לא חובה. כמה שורות על הרב למי שלא מכיר את פועלו.',
  rabbanit: 'לא חובה. כמה שורות על הרבנית למי שלא מכיר את פועלה.',
};

export const LIVE_NOTE = 'מה שתשמור כאן יופיע באתר מיד.';
export const SAVE_LABEL = 'שמירת הפרטים';
export const SAVING_LABEL = 'שומר...';
export const CANCEL_LABEL = 'ביטול';

export const LOADING_MESSAGE = 'טוען...';
export const ERROR_MESSAGE = 'לא הצלחנו לטעון את הפרטים שלך';
export const RETRY_LABEL = 'ניסיון נוסף';
