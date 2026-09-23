import { css } from 'styled-components';

import { DEDICATION_UNIT_HEIGHT_WRAPPED_PX } from '~/components/DedicationUnit/consts';

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
    padding-block: ${theme.spacing.xxl};
    margin-block-start: ${theme.spacing.section};

    @media (min-width: ${theme.breakpoints.md}) {
      margin-inline: calc(-1 * ${theme.spacing.xl});
      inline-size: calc(100% + 2 * ${theme.spacing.xl});
    }

    /* The pool has a dedication to show but the per-load draw has not run
       yet: reserves the block size a single unit is guaranteed to need,
       at its tallest (its name line wrapped), so the band does not go
       from absent to present under a reader already looking at the page
       (design-system.md, dedication "The draw", guarantee 3). */
    &.pending {
      min-block-size: calc(${DEDICATION_UNIT_HEIGHT_WRAPPED_PX}px + 2 * ${theme.spacing.xxl});
    }
  }

  &.onPage {
    /* No bleed: stays inside the rails column it is spliced into. */
    padding-block: ${theme.spacing.lg};

    &.pending {
      min-block-size: calc(${DEDICATION_UNIT_HEIGHT_WRAPPED_PX}px + 2 * ${theme.spacing.lg});
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
