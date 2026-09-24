import { SITE_CONTACT_PHONE_DISPLAY, SITE_CONTACT_PHONE_INTERNATIONAL } from '~/consts';

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
export const CALL_LABEL = SITE_CONTACT_PHONE_DISPLAY;
export const CALL_ACCESSIBLE_NAME = `התקשרות למספר ${SITE_CONTACT_PHONE_DISPLAY}`;
export const CALL_HREF = `tel:+${SITE_CONTACT_PHONE_INTERNATIONAL}`;
export const CLOSE_LABEL = 'סגירה';

// Feather Icons' "phone" glyph (MIT licensed), viewBox 0 0 24 24, redrawn at
// this codebase's own stroke width to match its other line icons.
export const CALL_ICON_PATH =
  'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z';

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
