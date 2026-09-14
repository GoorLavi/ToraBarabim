import type { Rabbi } from '@torabarabim/common';

// `dir="auto"` resolves direction from the value's first strong directional
// character. A value without one, whether empty or only whitespace, falls
// back to `ltr` in Chrome, which puts a Hebrew placeholder and the caret on
// the wrong side of a field the user reads as blank. Forcing `rtl` until
// there is real content, then handing back to `auto`, keeps a genuinely
// Latin value (a Latin place name) rendering LTR.
export const directionForValue = (value: string): 'rtl' | 'auto' => (value.trim() ? 'auto' : 'rtl');

// The one place a rabbi's public path is built, from the id React Router
// matches on and the slug that decorates it for a reader and for search
// results. Hebrew is not ASCII on the wire, so both segments are
// percent-encoded here; a caller never encodes either a second time. `Rabbi`
// (common/src/rabbi.ts) guarantees `slug` is never empty, so there is no
// bare-id fallback to fall back to.
export const rabbiPath = (rabbi: Pick<Rabbi, 'id' | 'slug'>): string =>
  `/rabbis/${encodeURIComponent(rabbi.id)}/${encodeURIComponent(rabbi.slug)}`;
