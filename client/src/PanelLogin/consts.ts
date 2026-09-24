export const WORDMARK = 'תורה ברבים';

// Role-neutral by construction: nobody's role (rabbi or place) is known
// before login, so this heading and subtext have to read fine for either.
// Reused verbatim from the rabbi login page's own gender-neutral copy
// rather than written fresh; see the builder's report for this slice.
export const HEADING = 'ברוכים הבאים';
export const SUBTEXT = 'כאן אפשר לעדכן את השיעורים ואת הפרטים שמופיעים באתר.';
export const IDENTIFIER_LABEL = 'אימייל או שם משתמש';
export const PASSWORD_LABEL = 'סיסמה';
export const SUBMIT_LABEL = 'כניסה';
export const SUBMIT_PENDING_LABEL = 'מתחברים...';

// The one string both shipped login pages already used verbatim: nothing to
// lose and nothing to write.
export const INVALID_CREDENTIALS_ERROR = 'אימייל, שם משתמש או סיסמה שגויים';
// Editor-approved for this slice. Matches the server's own account-deactivated
// message (server/src/api/panel/auth/index.ts).
export const DEACTIVATED_ERROR = 'החשבון אינו פעיל. אפשר לפנות למי שהקים אותו כדי להפעיל אותו מחדש.';

// Covers a login failure that is neither invalid credentials, a deactivated
// account, nor the rate limit: a server error, or the request never
// reaching the server at all.
export const GENERIC_LOGIN_ERROR = 'ההתחברות לא הצליחה. אפשר לנסות שוב בעוד רגע.';

export const FORGOT_PASSWORD_NOTE =
  'שכחת סיסמה? החשבון נפתח עבורך על ידי מי שהקים אותו, ואיפוס הסיסמה נעשה דרכו.';

// Genericised from the rabbi-only page's message: this door now also serves
// place accounts, so the prefilled text no longer names a specific panel.
export const WHATSAPP_SUPPORT_MESSAGE = 'שלום, נתקלתי בבעיה בהתחברות לפאנל ואשמח לעזרה.';
export const WHATSAPP_SUPPORT_TOOLTIP = 'פנו אלינו בוואטסאפ';

// The one element on this page allowed to break the 48px tap-target scale,
// since it has to be found without reading.
export const WHATSAPP_BUTTON_SIZE = '56px';

// No z-index scale exists yet in this codebase for a fixed page element like
// this; it is the one place that needs to sit above everything else on the
// login page.
export const WHATSAPP_BUTTON_Z_INDEX = 10;
