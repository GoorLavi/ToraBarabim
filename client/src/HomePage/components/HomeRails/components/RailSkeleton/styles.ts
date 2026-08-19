import { css } from 'styled-components';

import { CARD_WIDTH_LG, CARD_WIDTH_MD, CARD_WIDTH_PHONE } from '~/HomePage/components/LessonRail/consts';

import { SKELETON_BODY_HEIGHT } from './consts';

// Static, or at most a slow pulse, per the ratified loading state: no
// spinner (design-system.md, Feel: "Not heavy animation, not decoration").
// Slowed from 1.2s to 2s (design review, item 9): six cards and two heading
// bars breathing together read as more movement than the site wants.
export const RailSkeleton = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};

  > .headingBar {
    inline-size: 180px;
    block-size: 28px;
    border-radius: ${theme.radii.sm};
    background: ${theme.colors.primarySoft};
    animation: railSkeletonPulse 2s ease-in-out infinite;
  }

  > .cards {
    display: flex;
    gap: ${theme.spacing.md};
    overflow: hidden;
    /* Mirrors LessonRail's .scrollerWrap/.scroller exactly, so a skeleton
       card lands on the same pixel its real card will occupy, and the row
       never overflows the viewport while loading (design review, item 1). */
    margin-inline: calc(-1 * ${theme.spacing.lg});
    padding-inline: ${theme.spacing.lg};

    @media (min-width: ${theme.breakpoints.md}) {
      gap: ${theme.spacing.lg};
      margin-inline: calc(-1 * ${theme.spacing.xl});
      padding-inline: ${theme.spacing.xl};
    }

    > .card {
      flex: 0 0 ${CARD_WIDTH_PHONE};
      display: flex;
      flex-direction: column;
      /* One continuous surface, matching LessonCard's own container
         (border, radius, overflow, background all live here, not on the
         poster/body children), so the skeleton reads as one card rather
         than two stacked blocks (design review round 2, P3). */
      overflow: hidden;
      border: 1px solid ${theme.colors.border};
      border-radius: ${theme.radii.lg};
      background: ${theme.colors.primarySoft};
      animation: railSkeletonPulse 2s ease-in-out infinite;

      @media (min-width: ${theme.breakpoints.md}) {
        flex-basis: ${CARD_WIDTH_MD};
      }

      @media (min-width: ${theme.breakpoints.lg}) {
        flex-basis: ${CARD_WIDTH_LG};
      }

      > .poster {
        aspect-ratio: 3 / 4;
      }

      > .body {
        block-size: ${SKELETON_BODY_HEIGHT};
      }
    }
  }

  @keyframes railSkeletonPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
`,
);
