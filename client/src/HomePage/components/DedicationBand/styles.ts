import { css } from 'styled-components';

import { scaledCss } from '~/components/DedicationUnit/consts';

import * as consts from './consts';

// The viewport clips at all times, in both variants and before any JS runs:
// static is the SSR baseline, since the server cannot measure, and a long
// group rendered statically before hydration must never widen the page
// (design-system.md, "The band's behaviour"). `.overflowing` is the only
// thing that turns on scrolling, added once the resize measurement confirms
// the track is actually wider than the container.
export const DedicationBand = css(
  ({ theme }) => `
  position: relative;

  /* The band's own scale driver, read by every scaled dedication value
     (DedicationUnit/styles.ts, and the padding-block and reservation
     below): the band must never exceed
     ${consts.DEDICATION_BAND_FOLD_SHARE * 100}% of the real viewport
     height, so this is computed from 100svh rather than dialled by hand.
     100svh, never 100dvh: dvh tracks the address bar's own show/hide
     during scroll, so a dvh-driven scale would resize a person's name
     while someone is reading it. svh stays fixed for the life of the
     page and guarantees the ${consts.DEDICATION_BAND_FOLD_SHARE * 100}%
     ceiling against the worst-case fold (bar shown) rather than the
     best-case one (bar hidden).
     A length, not a unitless ratio: deriving a unitless number from
     100svh needs calc() type-checking support this project should not
     depend on, while a length divided by a number is a length, which
     every browser already supports. Every reference value this is
     multiplied against elsewhere is written as a bare, unitless number
     for the same reason, a length times a length is an area, not a
     length.
     Two floors, not one, and the boundary is deliberate: below md a
     desktop reader has not arrived yet, so the phone floor holds; from md
     up, a reader sits roughly twice as far from the screen (about 60cm
     against a phone's 30cm), so the same angular size needs roughly
     double the pixels, and without the higher floor a 1280x700 laptop, a
     common window, would clamp at the phone floor instead.
     Known and accepted: a landscape phone (about 390 tall) puts
     ${consts.DEDICATION_BAND_FOLD_SHARE * 100}% at 109px, far under even
     the lower floor's 216px, so the band lands near 55% of that fold and
     no value of this scale can fix it without a second axis of
     conditional geometry, which nobody has asked for. */
  --dedication-scale-px: clamp(${consts.DEDICATION_SCALE_FLOOR_BELOW_MD}px, calc(100svh * ${consts.DEDICATION_BAND_FOLD_SHARE} / ${consts.DEDICATION_BAND_ON_PRIMARY_HEIGHT_REFERENCE}), 1px);

  @media (min-width: ${theme.breakpoints.md}) {
    --dedication-scale-px: clamp(${consts.DEDICATION_SCALE_FLOOR_FROM_MD}px, calc(100svh * ${consts.DEDICATION_BAND_FOLD_SHARE} / ${consts.DEDICATION_BAND_ON_PRIMARY_HEIGHT_REFERENCE}), 1px);
  }

  &.onPrimary {
    background: ${theme.colors.primaryStrong};
    /* Full bleed: cancels HomePage's own inline gutter so this reaches the
       true viewport edge instead of stopping at the content band like the
       page's other sections. HomePage/styles.ts deliberately keeps a
       constant two-step gutter (lg, then xl from md) rather than the
       shared contentGutterInline helper, because this page's band is
       uncapped and never collapses that gutter to zero, so there is no
       third breakpoint to mirror here either. */
    margin-inline: calc(-1 * ${theme.spacing.lg});
    inline-size: calc(100% + 2 * ${theme.spacing.lg});
    padding-block: ${scaledCss(consts.DEDICATION_BAND_PADDING_ON_PRIMARY_REFERENCE, consts.DEDICATION_BAND_PADDING_FLOOR_PX)};
    margin-block-start: ${theme.spacing.section};

    @media (min-width: ${theme.breakpoints.md}) {
      margin-inline: calc(-1 * ${theme.spacing.xl});
      inline-size: calc(100% + 2 * ${theme.spacing.xl});
    }

    /* The pool has a dedication to show but the per-load draw has not run
       yet: reserves the block size the band is guaranteed to need at this
       scale, so it does not go from absent to present under a reader
       already looking at the page (design-system.md, dedication "The
       draw", guarantee 3). Scaled the same way as the real content, off
       the same driver, rather than a fixed figure: a fixed reservation
       would be wrong at every scale but the one it was measured at. */
    &.pending {
      min-block-size: ${scaledCss(consts.DEDICATION_BAND_ON_PRIMARY_HEIGHT_REFERENCE, consts.DEDICATION_BAND_ON_PRIMARY_HEIGHT_REFERENCE * consts.DEDICATION_SCALE_FLOOR_BELOW_MD)};
    }
  }

  &.onPage {
    /* No bleed: stays inside the rails column it is spliced into. */
    padding-block: ${scaledCss(consts.DEDICATION_BAND_PADDING_ON_PAGE_REFERENCE, consts.DEDICATION_BAND_PADDING_FLOOR_PX)};

    &.pending {
      min-block-size: ${scaledCss(consts.DEDICATION_BAND_ON_PAGE_HEIGHT_REFERENCE, consts.DEDICATION_BAND_ON_PAGE_HEIGHT_REFERENCE * consts.DEDICATION_SCALE_FLOOR_BELOW_MD)};
    }
  }

  /* No touch-action declaration here, deliberately: pan-x was tried and
     measured to trap a vertical swipe that starts on the band instead of
     letting it scroll the page (measured on a real device viewport: an
     on-band swipe moved the page 0px, the identical swipe just above it
     moved the page normally). The overflow-x auto below already restricts
     this element to horizontal panning by default and leaves vertical to
     the page; pan-x overrides that default down to horizontal-only, the
     opposite of what was wanted. */
  > .viewport {
    position: relative;
    display: flex;
    /* Centres a short pool instead of leaving it flush to the inline
       start, with a gap in the middle of the band (owner, on the real
       site). Never scoped to a variant: both the plum foot band and the
       page-field between-rails band centre a short pool the same way.
       Overridden to flex-start below once overflowing, the only state a
       centred track would ever need to scroll. */
    justify-content: center;
    overflow: hidden;
    overscroll-behavior-inline: contain;
    scrollbar-width: none;
    /* This is a drag surface, deliberately: without this, a drag starting
       on a name selects the text instead of moving the band, on both a
       phone and a mouse, dragging a highlight across a dedication while
       the band itself does not move (owner, on a real phone). The cost is
       real and accepted, not an oversight: nobody can select or copy a
       name off the band, but the same name is reachable in full elsewhere
       and a drag surface that fights the reader's own drag is the worse
       failure. Scoped to the band, never to DedicationUnit itself, which
       also renders in the admin preview panel, not a drag surface, where
       an admin may reasonably want to select what they typed. The prefix
       is still required on iOS Safari, exactly where this was found. */
    user-select: none;
    -webkit-user-select: none;
    /* Framing at the true edges of the whole strip, real track and looped
       duplicate together, never per copy: DEDICATION_BAND_EDGE_PADDING_PX
       in consts.ts hand-mirrors this for the overflow test and the loop's
       wrap period, both of which have to know how much of this element's
       own width is never track content. */
    padding-inline: ${theme.spacing.lg};
    /* The gap between the real track and its looped duplicate, matching
       the 64px every other pair of units gets: the track's own padding
       used to carry this framing instead, which put two copies of it
       (32px total) at the seam rather than the 64 every internal pair
       gets. Harmless with a single, non-overflowing track, since a flex
       gap only applies between children. */
    gap: ${consts.DEDICATION_UNIT_GAP_PX}px;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  &.overflowing > .viewport {
    overflow-x: auto;
    /* A crawling or scrollable track starts at its own inline start, never
       centred: a centred scroll origin has no natural resting position. */
    justify-content: flex-start;

    @media (pointer: fine) {
      cursor: grab;
    }
  }

  &.dragging > .viewport {
    @media (pointer: fine) {
      cursor: grabbing;
    }
  }

  /* The loop's second copy is marked aria-hidden, so a screen reader never
     meets every dedication twice from this one band (design-system.md,
     "Three traps"). Laid out as a sibling flex item of the same width
     immediately after the real track, with the viewport's own gap between
     them (above) standing in for the framing padding that used to sit
     here, so the two together form one continuous strip exactly the loop
     period long; a shrink-proof flex item on both keeps that true even
     while the viewport itself is narrower than either copy. Stretched, not
     started at the top: every unit in the row takes the height of the
     tallest one, so a unit with fewer lines does not close its lower
     ornament short of its neighbours' (DedicationUnit's own lower ornament
     absorbs the difference with an auto top margin). */
  > .viewport > .track {
    flex-shrink: 0;
    display: flex;
    align-items: stretch;
    gap: ${consts.DEDICATION_UNIT_GAP_PX}px;
  }

  > .fade {
    position: absolute;
    z-index: 1;
    inset-block: 0;
    inline-size: ${consts.EDGE_FADE_WIDTH_PX};
    pointer-events: none;
  }

  /* Both fades' own positions stay logical; their gradient axes cannot,
     since CSS has no logical gradient direction and the page is
     permanently RTL (mirrors LessonRail's own fade), so each names a
     physical side opposite the other. */
  > .fade.start {
    inset-inline-start: 0;
  }

  > .fade.end {
    inset-inline-end: 0;
  }

  &.onPrimary {
    > .fade.start {
      background: linear-gradient(to right, ${theme.colors.primaryStrong} 0%, transparent 100%);
    }

    > .fade.end {
      background: linear-gradient(to left, ${theme.colors.primaryStrong} 0%, transparent 100%);
    }

    /* Mirrors SiteLogoLink/styles.ts's own outline colour for the plum
       field: the browser's default focus ring reads poorly against it,
       and a 435px-tall focusable element (only ever focusable while
       overflowing, tabIndex is conditional on it) needs a visible one. */
    > .viewport:focus-visible {
      outline: 2px solid ${theme.colors.textOnPrimary};
      outline-offset: 2px;
    }
  }

  &.onPage {
    > .fade.start {
      background: linear-gradient(to right, ${theme.colors.bg} 0%, transparent 100%);
    }

    > .fade.end {
      background: linear-gradient(to left, ${theme.colors.bg} 0%, transparent 100%);
    }

    > .viewport:focus-visible {
      outline: 2px solid ${theme.colors.primary};
      outline-offset: 2px;
    }
  }
`,
);
