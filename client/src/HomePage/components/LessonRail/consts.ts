export const PREV_LABEL = 'לשיעורים הקודמים';
export const NEXT_LABEL = 'לשיעורים הבאים';

// The grid's own phone column count (components/LessonsGrid/styles.ts,
// `repeat(2, 1fr)` below `md`). The card's own phone width is derived from
// this in helpers.ts (`railCardWidth`), not retyped as a pixel literal, so
// a change to the grid's phone step has to change this together with it.
// From `sm` up the rail no longer follows the grid's column count at all;
// see the fixed per-tier widths below.
export const RAIL_COLUMNS_PHONE = 2;

// The card's fixed width per tier, from `sm` (480) up (design-system.md,
// "Horizontal rails"). A ladder, not a formula solved against the viewport:
// inside a tier the card never recomputes, and only the whole-card count on
// screen changes as the window moves.
export const RAIL_CARD_WIDTH_SM = '216px';
export const RAIL_CARD_WIDTH_MD = '232px';
export const RAIL_CARD_WIDTH_WIDE = '276px';
export const RAIL_CARD_WIDTH_XWIDE = '296px';

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
