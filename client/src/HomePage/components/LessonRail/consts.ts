export const PREV_LABEL = 'לשיעורים הקודמים';
export const NEXT_LABEL = 'לשיעורים הבאים';

// The grid's own phone column count (components/LessonsGrid/styles.ts,
// `repeat(2, 1fr)` below `md`). The card's own phone width is derived from
// this in helpers.ts (`railCardWidth`), not retyped as a pixel literal, so
// a change to the grid's phone step has to change this together with it.
// From `md` up the rail no longer follows the grid's column count at all;
// see RAIL_CARD_WIDTH_DESKTOP below.
export const RAIL_COLUMNS_PHONE = 2;

// The card's ceiling from `md` (768) up: the ratified widest size the site's
// widest desktop case (>= 1328) already used for the grid's own column, and
// the `var()` fallback useRailCardWidth.ts's measurement renders before its
// first resize observation lands (SSR, first paint), so there is no flash of
// an unsized card. There is still no column-count breakpoint ladder to
// maintain: however many cards fit the viewport, at whatever width between
// RAIL_CARD_WIDTH_MIN and this, is how many show.
export const RAIL_CARD_WIDTH_DESKTOP = '308px';

// The card's floor from `md` up, so it can flex narrower than the 308
// ceiling instead of jumping straight to it: comfortably clear of the 243px
// a five-column grid would have produced (rejected as a "thumbnail",
// design-system.md, breakpoints section), and close to where a 3-card row
// already lands unaided around 850-950px viewports. Read by
// useRailCardWidth.ts, not by a CSS `minmax()` track: a grid's own minmax
// growth cannot use this range correctly against an unbounded, scrollable
// item list (verified against a real rail's item range in a real browser,
// 2026-09-22 refinement), because its free-space step runs against every
// implicit track the row has, not just the ones in view, and pins every
// card to this floor regardless of viewport once a row has more items than
// fit even at the floor.
export const RAIL_CARD_WIDTH_MIN = '260px';

// Set on the scroller's own scrolling container by useRailCardWidth.ts, read
// by styles.ts's `flex-basis` from `md` up.
export const RAIL_CARD_WIDTH_PROPERTY = '--rail-card-width';

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
