import { css } from 'styled-components';

import { CARD_WIDTH_LG, CARD_WIDTH_MD, CARD_WIDTH_PHONE } from '~/HomePage/components/LessonRail/consts';

// Static, not a pulse: a breathing block reads as a fault to an audience
// that spans a wide age range and often reads outdoors, and the shape below
// (LessonCardSkeleton) is doing the work a pulse used to compensate for
// (design review, item: "Drop the pulse from RailSkeleton").
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

      @media (min-width: ${theme.breakpoints.md}) {
        flex-basis: ${CARD_WIDTH_MD};
      }

      @media (min-width: ${theme.breakpoints.lg}) {
        flex-basis: ${CARD_WIDTH_LG};
      }
    }
  }
`,
);
