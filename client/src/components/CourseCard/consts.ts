// The date line's own two tiers (design gate finding), narrower than the
// card's own `CARD_WIDE_THRESHOLD` (190px, ~/consts.ts): below this, the
// compact numeric date ("17.11") replaces the long form, which would
// otherwise crowd a narrow card before the rest of the body needs to
// react.
export const CARD_DATE_COMPACT_THRESHOLD = '136px';

// From this width the long date ("3 בנובמבר") reads as the card's own
// second hero value, set in `text` and semibold rather than the quiet
// `textSecondary` regular weight every other tier keeps.
export const CARD_DATE_SEMIBOLD_THRESHOLD = '150px';
