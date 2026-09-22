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
       breakpoints \`~/styles/contentBand.ts\`'s \`contentGutterInline\`
       applies to \`<main>\`, so this reaches the true viewport edge instead
       of stopping at the content band like the page's other sections. */
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

  > .viewport > .track {
    display: flex;
    align-items: flex-start;
    gap: ${consts.DEDICATION_UNIT_GAP_PX}px;
    padding-inline: ${theme.spacing.lg};
  }

  /* The loop's second copy, `aria-hidden` so a screen reader never meets
     every dedication twice from this one band (design-system.md, "Three
     traps"). Laid out as a sibling flex item of equal width, immediately
     after the real track, so the two together form one continuous strip
     exactly two track widths long. */
  > .viewport {
    display: flex;
  }

  > .viewport > .track.duplicate {
    flex-shrink: 0;
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
     permanently RTL (mirrors LessonRail/styles.ts's own \`.fade\`), so each
     names a physical side opposite the other. */
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
