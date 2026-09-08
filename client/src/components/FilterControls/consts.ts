// The stacking context every header layer shares: the sticky band at `lg`
// and up, and the pinned bar and its expand panel below it. Must stay under
// the date picker's mobile sheet scrim (100) and above the city and
// calendar popovers inside the header (20).
export const HEADER_Z_INDEX = 30;

// Hysteresis for `usePinnedHeaderVisibility`: shows once the full header has
// scrolled fully past, hides again only once scrolled back up this much
// further, so a thumb resting near the boundary does not flap the bar.
export const PINNED_BAR_HYSTERESIS_PX = 40;

// Used only when `ResizeObserver` is unavailable: the header's own
// hand-measured height at each range.
export const FALLBACK_HEADER_HEIGHT_PHONE_PX = 192;
export const FALLBACK_HEADER_HEIGHT_TABLET_PX = 140;
