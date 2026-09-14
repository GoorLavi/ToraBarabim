export const SITE_ORIGIN = 'https://torahbarabim.com';

export const SITE_NAME = 'תורה ברבים';

// Cloudflare Web Analytics site token. Public by design: it ships in the page
// source of every site that uses the product, and it grants nothing beyond
// reporting a page view for this site.
export const CLOUDFLARE_ANALYTICS_TOKEN = '4def41ef690f4c8391068f73d4238e89';

// The sitewide default title and description, used by root.tsx for every
// route that does not override them with its own `meta` export.
export const DEFAULT_TITLE = 'תורה ברבים | שיעורי תורה לפי רב, מקום ותאריך';
export const DEFAULT_DESCRIPTION =
  'כל שיעורי התורה במקום אחד. חיפוש לפי רב, לפי עיר ולפי תאריך, ומה נמסר הערב קרוב אליכם.';
