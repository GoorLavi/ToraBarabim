import { SITE_ORIGIN } from '~/../consts';

export const TILE_TITLE = 'שיעור טוב לא שומרים בסוד';
export const TILE_LINE = 'עזרו לנו ושתפו את האתר עם חברים.';
export const TILE_BUTTON_LABEL = 'שיתוף בוואטסאפ';

// The link sits on its own line with nothing after it, so WhatsApp makes it
// tappable without trailing punctuation. Built from SITE_ORIGIN and never
// from the current location, so the server-rendered markup and the
// hydrated page agree on the href.
export const SHARE_MESSAGE = `תורה ברבים: שיעורי תורה בכל הארץ, לפי יום, לפי עיר ולפי רב.\n${SITE_ORIGIN}`;
