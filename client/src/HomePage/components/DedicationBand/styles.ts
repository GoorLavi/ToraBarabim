import { css } from 'styled-components';

import { dedicationScaleCss, scaledCss } from '~/components/DedicationUnit/consts';

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
  display: flex;
  flex-direction: column;

  /* The whole band is a press target, not only the invite line, so the
     pointer cursor covers the whole element at rest and on hover; "grabbing"
     only replaces it once a drag clears the press threshold (.dragging
     below, usePressHandlers.ts). Touch has no cursor to set. */
  @media (pointer: fine) {
    cursor: pointer;
  }

  &.dragging {
    @media (pointer: fine) {
      cursor: grabbing;
    }
  }

  /* The band's own padding-block below reads the scale too, so the band
     declares it as well as every unit inside it, from the one shared
     definition (DedicationUnit/consts.ts, which also explains how the two
     figures were worked out and why the real band lands closer to the
     individual floors than to either target). */
  ${dedicationScaleCss(theme)}

  /* Full bleed in both variants: a horizontally scrolling row cancels the
     page gutter and re-applies it as its own inline padding (.viewport
     below), so the strip reaches the true viewport edge and the next
     unit's peek is not cut short inside the column. HomePage/styles.ts
     deliberately keeps a constant two-step gutter (lg, then xl from md)
     rather than the shared contentGutterInline helper, because this page's
     band is uncapped and never collapses that gutter to zero, so there is
     no third breakpoint to mirror here either. */
  margin-inline: calc(-1 * ${theme.spacing.lg});
  inline-size: calc(100% + 2 * ${theme.spacing.lg});

  @media (min-width: ${theme.breakpoints.md}) {
    margin-inline: calc(-1 * ${theme.spacing.xl});
    inline-size: calc(100% + 2 * ${theme.spacing.xl});
  }

  &.onPrimary {
    background: ${theme.colors.primaryStrong};
    padding-block: ${scaledCss(consts.DEDICATION_BAND_PADDING_ON_PRIMARY_REFERENCE, consts.DEDICATION_BAND_PADDING_FLOOR_PX)};
    margin-block-start: ${theme.spacing.section};

    /* Mirrors SiteLogoLink/styles.ts's own outline colour for the plum
       field: the browser's default focus ring reads poorly against it,
       and a 435px-tall focusable element (only ever focusable while
       overflowing, tabIndex is conditional on it) needs a visible one. */
    > .viewport:focus-visible {
      outline: 2px solid ${theme.colors.textOnPrimary};
      outline-offset: 2px;
    }

    > .invite {
      color: ${theme.colors.textOnPrimary};
    }
  }

  &.onPage {
    padding-block: ${scaledCss(consts.DEDICATION_BAND_PADDING_ON_PAGE_REFERENCE, consts.DEDICATION_BAND_PADDING_FLOOR_PX)};

    > .viewport:focus-visible {
      outline: 2px solid ${theme.colors.primary};
      outline-offset: 2px;
    }

    > .invite {
      color: ${theme.colors.primary};
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
       the gap every other pair of units gets: the track's own padding
       used to carry this framing instead, which put two copies of it at
       the seam rather than the one gap every internal pair gets. Harmless
       with a single, non-overflowing track, since a flex gap only applies
       between children. */
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

  /* Plain text, not a bordered chip: it reads as an invitation sitting
     under the strip, not a control beside it. Its own rules, not
     TextLink/styles.ts's: full width and centred where TextLink is
     content-width, a variant-driven colour (.onPrimary/.onPage above)
     where TextLink's is fixed, hover is underline-only where TextLink's
     also changes colour, and there is no active-state background. Only the
     chevron glyph is actually shared (Chevron.tsx); the rest would mean
     overriding most of TextLink's own block regardless. */
  > .invite {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    inline-size: 100%;
    min-block-size: 48px;
    margin-block-start: ${theme.spacing.sm};
    background: none;
    border: none;
    padding: 0;
    font-weight: ${theme.typography.fontWeight.semiBold};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
    text-decoration: none;
    cursor: pointer;

    > .chevron {
      inline-size: 7px;
      block-size: 12px;
      flex-shrink: 0;
    }

    &:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 2px;
    }
  }

  /* Names never change state on hover, press or focus: scoped to ".invite"
     alone, never to the band as a whole. */
  &:hover > .invite {
    text-decoration: underline;
  }

`,
);
