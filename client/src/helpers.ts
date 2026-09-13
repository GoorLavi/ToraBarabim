import type { Rabbi } from '@torabarabim/common';

// `dir="auto"` resolves direction from the value's first strong directional
// character. A value without one, whether empty or only whitespace, falls
// back to `ltr` in Chrome, which puts a Hebrew placeholder and the caret on
// the wrong side of a field the user reads as blank. Forcing `rtl` until
// there is real content, then handing back to `auto`, keeps a genuinely
// Latin value (a Latin place name) rendering LTR.
export const directionForValue = (value: string): 'rtl' | 'auto' => (value.trim() ? 'auto' : 'rtl');

// Shared by every place that links to a rabbi's public page (RabbisPage's
// index row, the home page rail, and the city page rail): the id alone
// still resolves and redirects to the canonical URL server side, so an
// empty slug falls back to it rather than producing a trailing slash.
export const rabbiPath = (rabbi: Pick<Rabbi, 'id' | 'slug'>): string =>
  rabbi.slug ? `/rabbis/${rabbi.id}/${encodeURIComponent(rabbi.slug)}` : `/rabbis/${rabbi.id}`;
