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

// The entries that belong on every page regardless of which route rendered
// it. React Router replaces a parent's meta array wholesale rather than
// merging it by key, so a route exporting its own `meta` drops everything
// root.tsx sets unless it spreads these back in, which every public route
// does. Order within the array does not matter, only that the spread is
// there. Defined here, beside the other sitewide values, because root.tsx
// and every route module need the identical list and two copies would
// drift apart silently.
export const SITE_WIDE_META = [
  { property: 'og:site_name', content: SITE_NAME },
  { property: 'og:locale', content: 'he_IL' },
  { name: 'twitter:card', content: 'summary' },
];
