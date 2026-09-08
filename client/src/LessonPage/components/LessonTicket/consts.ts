// The poster's fixed width on the ticket. On a phone it keeps its own 3:4
// ratio; on desktop it stretches to the card's own height instead (design
// spec, "The poster does not contribute to H"), so no ratio is set there.
export const POSTER_WIDTH_PHONE = '132px';
export const POSTER_WIDTH_DESKTOP = '285px';

// Half of this sits outside the ticket's own edge; `overflow: hidden` on the
// ticket clips that half, leaving the bite that reads as a punched notch.
export const NOTCH_DIAMETER = '16px';

// The perforation's rhythm (design spec): a 2px dash, a 6px gap, at 1px
// thickness. Drawn as a repeating gradient rather than `border-style: dashed`,
// which cannot hold a gap this precise across browsers.
export const PERFORATION_DASH = '2px';
export const PERFORATION_GAP = '6px';
export const PERFORATION_THICKNESS = '1px';

// The stub and body's own block padding on a phone: 24 inline
// (theme.spacing.xl) but 20 block, a value the shared spacing scale has no
// step for (frame measurement). Desktop steps this up to `xxl` (32), which
// is already on the scale.
export const PANEL_BLOCK_PADDING_PHONE = '20px';

// The stub's single-column layout at `lg`: a short rule between the date and
// the time, in place of the two-column layout's full-height vertical hairline.
export const STUB_DIVIDER_LENGTH_DESKTOP = '56px';

// The gap between the stub's date block, its short rule, and its time block
// on desktop (frame measurement, not on the shared spacing scale).
export const STUB_WHEN_ROW_GAP_DESKTOP = '20px';

// The text column's own inline padding on desktop (frame measurement, not on
// the shared spacing scale).
export const TEXT_COLUMN_INLINE_PADDING_DESKTOP = '28px';

// A gap the shared spacing scale has no step for, between two supporting
// lines that sit closer together than the scale's smallest step: the
// street line under the venue, and the rabbi's title under their name.
// Also reused for the audience tag's own vertical padding, the third place
// this exact measurement appears.
export const TICKET_FINE_GAP = '2px';

// The card's own floor height on desktop: shorter content never shrinks the
// card below this (design spec, "Height hugs content with a floor of 380").
export const CARD_MIN_BLOCK_SIZE_DESKTOP = '380px';

// With no poster the main panel has only text in it, so the card caps
// narrower on desktop rather than becoming a wide, mostly empty band
// (design spec, "No photo").
export const CARD_MAX_INLINE_SIZE_NO_POSTER_DESKTOP = '640px';
