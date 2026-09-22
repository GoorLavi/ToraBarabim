export const PREV_LABEL = 'לשיעורים הקודמים';
export const NEXT_LABEL = 'לשיעורים הבאים';

// The grid's own phone column count (components/LessonsGrid/styles.ts,
// `repeat(2, 1fr)` below `md`). The card's own phone width is derived from
// this in helpers.ts (`railCardWidth`), not retyped as a pixel literal, so
// a change to the grid's phone step has to change this together with it.
// From `md` up the rail no longer follows the grid's column count at all;
// see RAIL_CARD_WIDTH_DESKTOP below.
export const RAIL_COLUMNS_PHONE = 2;

// The card's fixed width from `md` (768) up. This is the ratified ceiling
// the site's widest desktop case (>= 1328) already uses for the grid's own
// column: the card never grows past it. From `md` up there is no column-
// count breakpoint ladder to maintain, because the row is a horizontally
// scrolling flex container: however many 308px cards fit the viewport is
// how many show, and a partial card at the edge (peek) falls out of that
// arithmetic on its own, since a real viewport is essentially never an
// exact multiple of card-plus-gap.
export const RAIL_CARD_WIDTH_DESKTOP = '308px';

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
