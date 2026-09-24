import { SITE_CONTACT_PHONE_DISPLAY, SITE_CONTACT_PHONE_INTERNATIONAL } from '~/consts';

// Final copy, edited and copied exactly (root CLAUDE.md's copy list). The
// window's own gold lines, not the admin panel's `DEDICATION_TYPE_LABELS`:
// three fixed illustrations of what a dedication can say, shown together
// regardless of which band opened the window.
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

// Decorative only, sized well under the dedication unit's own 280px, worked
// out from the ornament's own reference-times-scale arithmetic
// (DedicationUnit/consts.ts: DEDICATION_ORNAMENT_WIDTH_REFERENCE is 280, and
// its floor is 120): 280 * 0.45 clears that floor by enough to read as
// deliberately small, not clipped against it.
export const ORNAMENT_SCALE_PX = '0.45px';

// The header's own bespoke padding, settled by the designer directly rather
// than drawn from the general 8px spacing scale (mirrors DedicationBand/
// consts.ts's own DEDICATION_BAND_PADDING_* figures, the one other place a
// dedication surface's spacing is a fixed design figure, not a token).
// Trimmed once already, at every width, from 32/28 to these: the window's
// own height had to clear the sheet's 90vh cap at 320x640.
export const HEADER_PADDING_TOP_PX = 24;
export const HEADER_PADDING_BOTTOM_PX = 20;
export const BODY_PADDING_TOP_PX = 20;
