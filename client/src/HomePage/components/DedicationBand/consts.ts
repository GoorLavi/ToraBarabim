import type { DedicationType } from '@torabarabim/common';

import { DEDICATION_UNIT_WIDTH_PX } from '~/components/DedicationUnit/consts';

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

// Hand-mirrors `theme.spacing.lg`: `styles.ts` puts this padding on
// `.viewport`, not on `.track`, so the loop's seam gets the same 64px
// every other pair of units gets instead of 32 (two `.track` copies each
// carrying their own edge padding, doubled up at the seam). `helpers.ts`
// and the measurement effect need the same number outside CSS, to know how
// much of `viewport.clientWidth` is never available to the track's own
// content.
export const DEDICATION_BAND_EDGE_PADDING_PX = 16;

// One label per type, not a shared generic one: up to three of these
// regions can be on the same page at once (HomePage.tsx), and a
// screen-reader user needs to tell them apart. Drafts, not final copy:
// tora-hebrew-editor may return different wording.
export const VIEWPORT_ARIA_LABEL_BY_TYPE: Record<DedicationType, string> = {
  success: 'הקדשות להצלחה, אפשר לגלול עם החצים',
  healing: 'הקדשות לרפואה שלמה, אפשר לגלול עם החצים',
  memorial: 'הקדשות לעילוי נשמה, אפשר לגלול עם החצים',
};

// The band's own scale driver (design-system.md, dedication geometry): a
// fixed value per breakpoint, selected by the same `md` width query every
// other responsive rule in this file already branches on, not a continuous
// function of the viewport the way the superseded 100svh-driven version was
// (owner, on the real site: "for the scale, I prefer width"). 418 is the
// onPrimary band's own rendered height at scale 1 (unit height, 354.04,
// plus its own 2 * 32 padding-block), the reference the whole band, not
// only its type, is measured against; onPage is never a second reference
// here, the same as before, since it carries less padding-block (16, not
// 32) and so lands a little shorter at the same scale without needing its
// own.
export const DEDICATION_BAND_ON_PRIMARY_HEIGHT_REFERENCE = 418;

// The owner's own target band heights, about 165 at phone and about 180 at
// desktop, worked backward into a scale through the reference above. Both
// sit under the arithmetic floor of the band's own content, the total
// height once every scaled line has already clamped to its own floor
// (measured at 181px for the unit alone, with no air anywhere): 180 is one
// pixel under that floor, 165 is sixteen under it. Built to the target
// scale anyway, on the owner's own instruction, rather than bent upward to
// clear it; the floors below still clamp where they clamp, and the real
// band lands closer to that 181px arithmetic minimum than to either target
// at both breakpoints, reported rather than hidden (root CLAUDE.md, "report
// the heights actually measured, not the targets themselves").
export const DEDICATION_BAND_TARGET_HEIGHT_PHONE_PX = 165;
export const DEDICATION_BAND_TARGET_HEIGHT_DESKTOP_PX = 180;
export const DEDICATION_SCALE_BELOW_MD = DEDICATION_BAND_TARGET_HEIGHT_PHONE_PX / DEDICATION_BAND_ON_PRIMARY_HEIGHT_REFERENCE;
export const DEDICATION_SCALE_FROM_MD = DEDICATION_BAND_TARGET_HEIGHT_DESKTOP_PX / DEDICATION_BAND_ON_PRIMARY_HEIGHT_REFERENCE;

export const DEDICATION_BAND_PADDING_ON_PRIMARY_REFERENCE = 32;
export const DEDICATION_BAND_PADDING_ON_PAGE_REFERENCE = 16;
export const DEDICATION_BAND_PADDING_FLOOR_PX = 8;

// A desktop reader sits roughly twice as far from the screen as a phone
// reader (about 60cm against 30cm), so a desktop dedication must never end
// up smaller than a phone one: the invariant the old 0.46-and-up floor pair
// used to defend directly. That exact threshold does not survive Decision
// 2, since both new targets sit under it by design, so this checks the
// ordering the reasoning actually depends on instead of a magic minimum.
// Checked at import time, once, rather than on every render: a value this
// only a deploy can change is a startup failure waiting to happen, not a
// runtime one (root CLAUDE.md, "fail at boot, not at first use").
if (DEDICATION_SCALE_FROM_MD <= DEDICATION_SCALE_BELOW_MD) {
  throw new Error(
    `Dedication scale from md (${DEDICATION_SCALE_FROM_MD}) must exceed the scale below md (${DEDICATION_SCALE_BELOW_MD}), or a desktop reader gets a smaller dedication than a phone reader.`,
  );
}
