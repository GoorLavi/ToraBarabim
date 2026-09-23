import { css } from 'styled-components';

import { CARD_WIDE_THRESHOLD } from '~/HomePage/components/LessonCard/consts';
import { POSTER_ASPECT_RATIO } from '~/HomePage/consts';

// Static, no timer-driven motion (design-system.md, Feel: "No heavy
// animation"; "any moving element is driven by the person, never on a
// timer"). Sizing (flex-basis or grid column) is the caller's job; this
// component only owns the card's own box and internal shape.
export const LessonCardSkeleton = css(
  ({ theme }) => `
  container-type: inline-size;
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
      /* A tinted bar like the text skeletons beside it, not a plain white
         square: white on \`primarySoft\` read as a hole punched in the card
         rather than a medallion still loading (design gate finding). */
      background: ${theme.colors.border};
    }
  }

  > .body {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.md};
    /* Mirrors the real LessonCard's own text block instead of an
       independently chosen height: card title line-height, two secondary
       lines, and the same block padding, stepped at the same
       CARD_WIDE_THRESHOLD so the two never disagree on how much room a
       loaded card actually needs. */
    block-size: calc(
      2 * ${theme.spacing.md} + ${theme.typography.cardTitleCompact.phone.lineHeight} + 2 * ${theme.spacing.xs} + 2 *
        ${theme.typography.secondaryCompact.phone.lineHeight}
    );

    @container (min-inline-size: ${CARD_WIDE_THRESHOLD}) {
      block-size: calc(
        2 * ${theme.spacing.md} + ${theme.typography.cardTitle.phone.lineHeight} + 2 * ${theme.spacing.xs} + 2 *
          ${theme.typography.secondary.phone.lineHeight}
      );
    }

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
