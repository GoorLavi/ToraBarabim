import { css } from 'styled-components';

import { POSTER_ASPECT_RATIO, SKELETON_BODY_HEIGHT } from '~/HomePage/consts';

// Static, no timer-driven motion (design-system.md, Feel: "No heavy
// animation"; "any moving element is driven by the person, never on a
// timer"). Sizing (flex-basis or grid column) is the caller's job; this
// component only owns the card's own box and internal shape.
export const LessonCardSkeleton = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.surface};

  > .poster {
    position: relative;
    aspect-ratio: ${POSTER_ASPECT_RATIO};
    background: ${theme.colors.primarySoft};

    > .medallion {
      position: absolute;
      inset-block-start: ${theme.spacing.sm};
      inset-inline-end: ${theme.spacing.sm};
      inline-size: 40px;
      block-size: 40px;
      border-radius: ${theme.radii.sm};
      background: ${theme.colors.surface};
    }
  }

  > .body {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.md};
    block-size: ${SKELETON_BODY_HEIGHT};

    > .titleBar,
    > .metaBar,
    > .cityBar {
      block-size: 14px;
      border-radius: ${theme.radii.sm};
      background: ${theme.colors.primarySoft};
    }

    > .titleBar {
      inline-size: 80%;
      block-size: 18px;
    }

    > .metaBar {
      inline-size: 60%;
    }

    > .cityBar {
      inline-size: 40%;
    }
  }
`,
);
