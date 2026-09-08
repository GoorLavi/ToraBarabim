export const WORDMARK = 'תורה ברבים';
export const BADGE_LABEL = 'אזור אישי';
export const HEADING = 'ברוך הבא';
export const SUBTEXT = 'כאן תעדכן את השיעורים שלך ואת הפרטים שמופיעים עליך באתר.';
export const IDENTIFIER_LABEL = 'אימייל או שם משתמש';
export const PASSWORD_LABEL = 'סיסמה';
export const SUBMIT_LABEL = 'כניסה';
export const SUBMIT_PENDING_LABEL = 'מתחבר...';
export const INVALID_CREDENTIALS_ERROR = 'אימייל, שם משתמש או סיסמה שגויים';
export const RATE_LIMITED_ERROR = 'יותר מדי ניסיונות כניסה. נסה שוב בעוד כמה דקות';
export const FORGOT_PASSWORD_NOTE =
  'שכחת סיסמה? החשבון נפתח עבורך על ידי מי שהקים אותו, ואיפוס הסיסמה נעשה דרכו.';

// International format, required by the wa.me link syntax.
export const WHATSAPP_SUPPORT_PHONE = '972527570636';
export const WHATSAPP_SUPPORT_MESSAGE = 'שלום, נתקלתי בבעיה בהתחברות לפאנל הרבנים ואשמח לעזרה.';
export const WHATSAPP_SUPPORT_HREF = `https://wa.me/${WHATSAPP_SUPPORT_PHONE}?text=${encodeURIComponent(WHATSAPP_SUPPORT_MESSAGE)}`;
export const WHATSAPP_SUPPORT_TOOLTIP = 'פנו אלינו בוואצאפ';

// Simple Icons' WhatsApp glyph (MIT licensed), viewBox 0 0 24 24.
export const WHATSAPP_ICON_PATH =
  'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884M20.52 3.449C18.24 1.245 15.24.032 12.045.032c-6.559 0-11.888 5.328-11.892 11.884a11.847 11.847 0 001.588 5.945L0 24l6.335-1.652a11.882 11.882 0 005.71 1.446h.005c6.556 0 11.887-5.328 11.892-11.884a11.85 11.85 0 00-3.422-8.461';

export const WHATSAPP_BUTTON_COLOR = '#1DA851';
export const WHATSAPP_BUTTON_COLOR_HOVER = '#17853F';

// The one element on this page allowed to break the 48px tap-target scale,
// since it has to be found without reading.
export const WHATSAPP_BUTTON_SIZE = '56px';

// No z-index scale exists yet in this codebase; this is the one place that
// needs to sit above everything else on the login page.
export const WHATSAPP_BUTTON_Z_INDEX = 10;
