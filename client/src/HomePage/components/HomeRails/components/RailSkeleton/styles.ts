import { css } from 'styled-components';

import {
  RAIL_CARD_WIDTH_MD,
  RAIL_CARD_WIDTH_SM,
  RAIL_CARD_WIDTH_WIDE,
  RAIL_CARD_WIDTH_XWIDE,
  RAIL_COLUMNS_PHONE,
} from '~/HomePage/components/LessonRail/consts';
import { railCardWidth, railEdgeOffset } from '~/HomePage/components/LessonRail/helpers';

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
    gap: ${theme.spacing.lg};
    overflow: hidden;
    /* Mirrors LessonRail's .scrollerWrap/.scroller exactly, so a skeleton
       card lands on the same pixel its real card will occupy, and the row
       never overflows the viewport while loading (design review, item 1). */
    margin-inline: calc(-1 * ${railEdgeOffset(theme, 'gutter')});
    padding-inline: ${railEdgeOffset(theme, 'gutter')};

    @media (min-width: ${theme.breakpoints.md}) {
      margin-inline: calc(-1 * ${railEdgeOffset(theme, 'full')});
      padding-inline: ${railEdgeOffset(theme, 'full')};
    }

    > .card {
      flex: 0 0 ${railCardWidth(theme, RAIL_COLUMNS_PHONE, railEdgeOffset(theme, 'gutter'))};

      /* Same four-tier ladder as the real card (LessonRail/styles.ts), so
         the loading skeleton lands on the same pixel the real row will. */
      @media (min-width: ${theme.breakpoints.sm}) {
        flex-basis: ${RAIL_CARD_WIDTH_SM};
      }

      @media (min-width: ${theme.breakpoints.md}) {
        flex-basis: ${RAIL_CARD_WIDTH_MD};
      }

      @media (min-width: ${theme.layout.fourColumnWidth}) {
        flex-basis: ${RAIL_CARD_WIDTH_WIDE};
      }

      @media (min-width: ${theme.layout.xwideRailWidth}) {
        flex-basis: ${RAIL_CARD_WIDTH_XWIDE};
      }
    }
  }
`,
);
