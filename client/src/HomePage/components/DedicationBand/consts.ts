import type { DedicationType } from '@torabarabim/common';

// Gap between units (design-system.md, dedication geometry). Hand-mirrors
// `theme.spacing.xxl`: the crawl's loop period and arrow-key pitch need the
// number outside CSS, so it cannot be read from the theme's "32px" string.
export const DEDICATION_UNIT_GAP_PX = 32;

// One unit's own footprint plus the gap after it: what an arrow key step
// moves, so a keyboard user steps whole units and never lands mid-name
// (design-system.md, dedication interaction rule 5). Hand-mirrors
// DEDICATION_UNIT_WIDTH_PX (200, DedicationUnit/consts.ts) plus
// DEDICATION_UNIT_GAP_PX above.
export const DEDICATION_UNIT_PITCH_PX = 232;

// A scroll container advanced per frame, not a CSS transform animation
// (design-system.md, "The band's behaviour"): manual scrolling, wrapping,
// resume-from-position and keyboard stepping are native properties of a
// scroll container that a transform animation would fight.
export const CRAWL_SPEED_PX_PER_SECOND = 32;

// Caps the elapsed time a single frame is allowed to advance the crawl by.
// A backgrounded tab (or any long stall) delivers its next
// requestAnimationFrame with a huge real delta, and advancing by the whole
// paused duration would jump the crawl many loop periods forward in one
// frame instead of resuming smoothly from where it was. A few frames'
// worth at 60Hz, generous enough to never clip a normal frame.
export const MAX_FRAME_DELTA_SECONDS = 0.1;

// A tunable, not a measurement: how long after the last touch interaction
// ends before the band resumes self-advancing. Touch has no hover to key
// off of, unlike a pointer device, which pauses and resumes immediately on
// enter and leave.
export const RESUME_AFTER_INTERACTION_MS = 4000;

// Hand-mirrors `theme.spacing.lg`: `styles.ts` puts this padding on
// `.viewport`, not on `.track`, so the loop's seam gets the same gap
// every other pair of units gets instead of two edge paddings (two `.track`
// copies each carrying their own, doubled up at the seam). `helpers.ts`
// and the measurement effect need the same number outside CSS, to know how
// much of `viewport.clientWidth` is never available to the track's own
// content.
export const DEDICATION_BAND_EDGE_PADDING_PX = 16;

// A primary pointer (any touch or pen point, or a mouse with button 0) that
// travels a straight-line distance strictly under this many pixels between
// down and up is a press, never a drag. Also gates the cursor's own switch
// to "grabbing" (styles.ts).
export const PRESS_MAX_TRAVEL_PX = 10;

export const INVITATION_LABEL = 'להקדשת פעילות האתר';

// One label per type, not a shared generic one: up to three of these
// regions can be on the same page at once (HomePage.tsx), and a
// screen-reader user needs to tell them apart. Drafts, not final copy:
// tora-hebrew-editor may return different wording.
export const VIEWPORT_ARIA_LABEL_BY_TYPE: Record<DedicationType, string> = {
  success: 'הקדשות להצלחה, אפשר לגלול עם החצים',
  healing: 'הקדשות לרפואה שלמה, אפשר לגלול עם החצים',
  memorial: 'הקדשות לעילוי נשמה, אפשר לגלול עם החצים',
};

export const DEDICATION_BAND_PADDING_ON_PRIMARY_REFERENCE = 32;
export const DEDICATION_BAND_PADDING_ON_PAGE_REFERENCE = 16;
export const DEDICATION_BAND_PADDING_FLOOR_PX = 8;
