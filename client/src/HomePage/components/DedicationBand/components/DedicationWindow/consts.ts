import { SITE_CONTACT_PHONE_DISPLAY } from '~/consts';

// The window's own gold lines, not the admin panel's `DEDICATION_TYPE_LABELS`:
// three fixed illustrations, shown together regardless of which band opened
// the window.
export const WINDOW_TITLE = 'הקדשת פעילות האתר';
export const FORMULA_MEMORIAL = 'לעילוי נשמת';
export const FORMULA_HEALING = 'לרפואה שלמה';
export const FORMULA_SUCCESS = 'להצלחה';
export const PARAGRAPH =
  'בכל יום אנשים מוצאים כאן שיעור תורה בעיר שלהם. אפשר להקדיש את פעילות האתר לאדם יקר לכם, והשם יופיע בעמוד הבית.';
export const LEAD_IN = 'לפרטים ולתיאום ההקדשה, אפשר לכתוב לנו בוואטסאפ או להתקשר:';
export const WHATSAPP_LABEL = 'שליחת הודעה בוואטסאפ';
export const WHATSAPP_MESSAGE = 'שלום, אשמח להקדיש את פעילות אתר תורה ברבים.';
// This window shows the number itself as the call button's visible label,
// unlike `ContactActions`' other caller, which shows the word "שיחה": the
// number is the one thing here worth reading before pressing.
export const CALL_LABEL = SITE_CONTACT_PHONE_DISPLAY;
export const CLOSE_LABEL = 'סגירה';

// Decorative only, sized well under the dedication unit's own 280px, worked
// out from the ornament's own reference-times-scale arithmetic
// (DedicationUnit/consts.ts: DEDICATION_ORNAMENT_WIDTH_REFERENCE is 280, and
// its floor is 120): 280 * 0.45 clears that floor by enough to read as
// deliberately small, not clipped against it.
export const ORNAMENT_SCALE_PX = '0.45px';

// Bespoke, not drawn from the spacing scale: the window's own height has to
// clear the sheet's 90vh cap at 320x640.
export const HEADER_PADDING_BOTTOM_PX = 20;
export const BODY_PADDING_TOP_PX = 20;
