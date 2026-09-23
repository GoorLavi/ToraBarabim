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

// 56 at every width, never stepping down the way the rail's does: the rail
// steps because its arrows take over from `md` up, and this band has no
// arrows and will not get them.
export const EDGE_FADE_WIDTH_PX = EDGE_FADE_WIDTH_PHONE;

// Hand-mirrors `theme.spacing.lg`: `styles.ts` puts this padding on
// `.viewport`, not on `.track`, so the loop's seam gets the same 64px
// every other pair of units gets instead of 32 (two `.track` copies each
// carrying their own edge padding, doubled up at the seam). `helpers.ts`
// and the measurement effect need the same number outside CSS, to know how
// much of `viewport.clientWidth` is never available to the track's own
// content.
export const DEDICATION_BAND_EDGE_PADDING_PX = 16;

export const VIEWPORT_ARIA_LABEL = 'הקדשות, אפשר לגלול עם החצים';

// The band's own fold-driven scale (design-system.md, dedication geometry):
// the band must never exceed FOLD_SHARE of the real viewport height, so the
// scale is derived from 100svh rather than dialled by hand. 418 is the
// onPrimary band's own rendered height at scale 1 (unit height, 354.04,
// plus its own 2 * 32 padding-block), the reference the whole band, not
// only its type, is measured against.
export const DEDICATION_BAND_FOLD_SHARE = 0.28;
export const DEDICATION_BAND_ON_PRIMARY_HEIGHT_REFERENCE = 418;

// Two floors, not one: below `md` the floor is 0.46; from `md` up it rises
// to 0.54. A desktop reader sits roughly twice as far from the screen as a
// phone reader (about 60cm against 30cm), so the same angular size needs
// roughly double the pixels, and without this a 1280x700 laptop, a common
// window, would clamp at the phone floor. 0.54 puts the name at 28px,
// exactly 2x the clamped 14px formula.
export const DEDICATION_SCALE_FLOOR_BELOW_MD = 0.46;
export const DEDICATION_SCALE_FLOOR_FROM_MD = 0.54;

// A landscape phone is about 390 tall, so 28% of that is 109px, far under
// even the 0.46 floor's 216px: the band lands near 55% of that fold and no
// value of the scale can fix it without a second axis of conditional
// geometry, which nobody has asked for. Known and accepted, not a bug to
// chase.
export const DEDICATION_BAND_PADDING_ON_PRIMARY_REFERENCE = 32;
export const DEDICATION_BAND_PADDING_ON_PAGE_REFERENCE = 16;
export const DEDICATION_BAND_PADDING_FLOOR_PX = 8;

// The floor this project has committed to (design-system.md): below it the
// name's own floor (24) stops being at least 1.71x the formula's own floor
// (14) once both are clamped, the ratio the design defends. Checked at
// import time, once, rather than on every render: a value this only a
// deploy can change is a startup failure waiting to happen, not a runtime
// one (root CLAUDE.md, "fail at boot, not at first use").
const MIN_DEDICATION_SCALE = 0.46;
if (DEDICATION_SCALE_FLOOR_BELOW_MD < MIN_DEDICATION_SCALE || DEDICATION_SCALE_FLOOR_FROM_MD < MIN_DEDICATION_SCALE) {
  throw new Error(
    `Dedication scale floor must be at least ${MIN_DEDICATION_SCALE}: got ${DEDICATION_SCALE_FLOOR_BELOW_MD} below md and ${DEDICATION_SCALE_FLOOR_FROM_MD} from md.`,
  );
}
