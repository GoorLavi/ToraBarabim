import { DEDICATION_UNIT_WIDTH_PX } from '~/components/DedicationUnit/consts';
import { EDGE_FADE_WIDTH_PHONE } from '~/HomePage/consts';

// Gap between units (design-system.md, dedication geometry).
export const DEDICATION_UNIT_GAP_PX = 64;

// One unit's own footprint plus the gap after it: what an arrow key step
// moves, so a keyboard user steps whole units and never lands mid-name
// (design-system.md, dedication interaction rule 5).
export const DEDICATION_UNIT_PITCH_PX = DEDICATION_UNIT_WIDTH_PX + DEDICATION_UNIT_GAP_PX;

// A scroll container advanced per frame, not a CSS transform animation
// (design-system.md, "The band's behaviour"): manual scrolling, wrapping,
// resume-from-position and keyboard stepping are native properties of a
// scroll container that a transform animation would fight.
export const CRAWL_SPEED_PX_PER_SECOND = 32;

// A tunable, not a measurement: how long after the last touch interaction
// ends before the band resumes self-advancing. Touch has no hover to key
// off of, unlike a pointer device, which pauses and resumes immediately on
// enter and leave.
export const RESUME_AFTER_INTERACTION_MS = 4000;

// 56 at every width, never stepping down the way the rail's does: the rail
// steps because its arrows take over from `md` up, and this band has no
// arrows and will not get them.
export const EDGE_FADE_WIDTH_PX = EDGE_FADE_WIDTH_PHONE;

export const VIEWPORT_ARIA_LABEL = 'הקדשות, אפשר לגלול עם החצים';
