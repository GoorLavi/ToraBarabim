import { css } from 'styled-components';

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
    /* Full bleed: cancels the page's own inline gutter, the same three
       breakpoints the shared contentGutterInline helper applies to the
       page's own main element, so this reaches the true viewport edge
       instead of stopping at the content band like the page's other
       sections. */
    margin-inline: calc(-1 * ${theme.spacing.lg});
    inline-size: calc(100% + 2 * ${theme.spacing.lg});
    padding-block: ${theme.spacing.xxl};
    margin-block-start: ${theme.spacing.section};

    @media (min-width: ${theme.breakpoints.md}) {
      margin-inline: calc(-1 * ${theme.spacing.xl});
      inline-size: calc(100% + 2 * ${theme.spacing.xl});
    }

    @media (min-width: calc(${theme.layout.contentMaxWidth} + 2 * ${theme.spacing.xl})) {
      margin-inline: 0;
      inline-size: 100%;
    }
  }

  &.onPage {
    /* No bleed: stays inside the rails column it is spliced into. */
    padding-block: ${theme.spacing.lg};
  }

  > .viewport {
    position: relative;
    display: flex;
    overflow: hidden;
    overscroll-behavior-inline: contain;
    scrollbar-width: none;
    touch-action: pan-x;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  &.overflowing > .viewport {
    overflow-x: auto;

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
     immediately after the real track, so the two together form one
     continuous strip exactly two track widths long; a shrink-proof flex
     item on both keeps that true even while the viewport itself is
     narrower than either copy. */
  > .viewport > .track {
    flex-shrink: 0;
    display: flex;
    align-items: flex-start;
    gap: ${consts.DEDICATION_UNIT_GAP_PX}px;
    padding-inline: ${theme.spacing.lg};
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
  }

  &.onPage {
    > .fade.start {
      background: linear-gradient(to right, ${theme.colors.bg} 0%, transparent 100%);
    }

    > .fade.end {
      background: linear-gradient(to left, ${theme.colors.bg} 0%, transparent 100%);
    }
  }
`,
);
