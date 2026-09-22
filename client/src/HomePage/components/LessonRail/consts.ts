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
