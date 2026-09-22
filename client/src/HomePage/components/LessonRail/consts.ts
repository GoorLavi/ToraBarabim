export const PREV_LABEL = 'לשיעורים הקודמים';
export const NEXT_LABEL = 'לשיעורים הבאים';

// The grid's own column counts (components/LessonsGrid/styles.ts:
// `repeat(2, 1fr)` below `md`, `repeat(3, 1fr)` from `md` to `xl`,
// `repeat(4, 1fr)` from `xl` up). The card's own width is derived from
// these in helpers.ts (`railCardWidth`), not retyped as pixel literals, so
// a change to the grid's own steps has to change these together with it.
export const RAIL_COLUMNS_PHONE = 2;
export const RAIL_COLUMNS_MD = 3;
export const RAIL_COLUMNS_XL = 4;

// Rail-only, temporary fix for the 768-1280 range (design-system.md,
// "Horizontal rails": the grid's own hold-at-956 does not automatically
// reach the rail, because the rail derives its card from the grid's column
// formula but does not share the grid's edge-offset logic). Below this
// width the naked 3-column formula would balloon the card past a reasonable
// ceiling; holding the band at 860px caps it at 276px instead:
// (860 - 2*16) / 3 = 276. 276, not the grid's own 308, because this value
// is chosen together with RAIL_FOUR_COL_BREAKPOINT below to make the two
// sides of that seam compute to the exact same card width (owner-tested
// live at 276px, "looks amazing"), not to match the grid, which this rail
// deliberately does not stay in sync with yet (see RAIL_FOUR_COL_BREAKPOINT).
export const RAIL_HELD_BAND_WIDTH = '860px';

// Where this rail switches from the held 3-column band above to 4 columns
// on the site's real content band (`helpers.ts`, `railEdgeOffset`'s `full`
// case, which is flat below `xl` and grows above it). Chosen so both sides
// of the seam compute to exactly the same card width, 276px: the held
// 3-column formula at 1200 and the 4-column full-band formula at 1200 both
// give (1200 - 2*24 - 3*16) / 4 = 276, so nothing jumps at the switch, and
// the card then keeps growing continuously into the real `>= xl` case with
// no jump at 1280 either.
//
// Known gap, not fixed here: the grid's own 4-column step is still at `xl`
// (1280), so between 1200 and 1280 this rail shows 4 columns at a viewport
// where the grid alongside it still shows 3. Syncing the grid's own
// breakpoint to 1200 is a real fix the designer flagged, scoped
// deliberately to a later change and out of this rail-only slice.
export const RAIL_FOUR_COL_BREAKPOINT = '1200px';

// This zone's 4-column stage (1200-1280) is the same count as
// RAIL_COLUMNS_XL's `>= xl` 4-column stage, but kept as its own constant so
// RAIL_COLUMNS_XL keeps meaning only "the >= 1280 case" and does not
// silently start meaning two different breakpoints.
export const RAIL_COLUMNS_WIDE = 4;

// A flick moves roughly one screenful of cards at a time.
export const SCROLL_STEP_RATIO = 0.9;

// `Rail Scroll` settle-debounce (useRailScrollTracking.ts): an arrow click's
// smooth scroll and a touch swipe both fire many native `scroll` events per
// gesture, so this window is how long the row waits after the last one
// before treating the gesture as finished and firing a single event.
export const RAIL_SCROLL_SETTLE_MS = 200;

// Below this many pixels of net travel, a gesture is treated as noise
// (a tap that barely moved the row) rather than a real scroll.
export const RAIL_SCROLL_MIN_DELTA = 24;
