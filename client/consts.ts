export const SITE_ORIGIN = 'https://torahbarabim.com';

export const SITE_NAME = 'תורה ברבים';

// Mixpanel project token. Public by design, like the Cloudflare token it
// replaces: it ships in the page source of every site that uses the
// product, and it identifies which Mixpanel project events land in, not a
// person.
export const MIXPANEL_PROJECT_TOKEN = '811128865ac744fd3ee48870ccb29cfd';

// The sitewide default title and description, used by root.tsx for every
// route that does not override them with its own `meta` export.
export const DEFAULT_TITLE = 'תורה ברבים | שיעורי תורה לפי רב, מקום ותאריך';
export const DEFAULT_DESCRIPTION =
  'כל שיעורי התורה במקום אחד. חיפוש לפי רב, לפי עיר ולפי תאריך, ומה נמסר הערב קרוב אליכם.';
