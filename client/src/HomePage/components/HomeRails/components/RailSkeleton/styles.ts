import { css } from 'styled-components';

import {
  RAIL_COLUMNS_MD,
  RAIL_COLUMNS_PHONE,
  RAIL_COLUMNS_WIDE,
  RAIL_COLUMNS_XL,
  RAIL_FOUR_COL_BREAKPOINT,
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
       never overflows the viewport while loading (design review, item 1).
       Held, not full, from \`md\` to RAIL_FOUR_COL_BREAKPOINT and 4 columns
       from there: matches LessonRail/styles.ts's own three-zone fix for the
       768-1280 range, so the skeleton reserves the actual space the loaded
       row will occupy instead of previewing the wider, pre-fix card and
       causing a reflow the moment real content arrives. */
    margin-inline: calc(-1 * ${railEdgeOffset(theme, 'gutter')});
    padding-inline: ${railEdgeOffset(theme, 'gutter')};

    @media (min-width: ${theme.breakpoints.md}) {
      margin-inline: calc(-1 * ${railEdgeOffset(theme, 'held')});
      padding-inline: ${railEdgeOffset(theme, 'held')};
    }

    @media (min-width: ${RAIL_FOUR_COL_BREAKPOINT}) {
      margin-inline: calc(-1 * ${railEdgeOffset(theme, 'full')});
      padding-inline: ${railEdgeOffset(theme, 'full')};
    }

    > .card {
      flex: 0 0 ${railCardWidth(theme, RAIL_COLUMNS_PHONE, railEdgeOffset(theme, 'gutter'))};

      @media (min-width: ${theme.breakpoints.md}) {
        flex-basis: ${railCardWidth(theme, RAIL_COLUMNS_MD, railEdgeOffset(theme, 'held'))};
      }

      @media (min-width: ${RAIL_FOUR_COL_BREAKPOINT}) {
        flex-basis: ${railCardWidth(theme, RAIL_COLUMNS_WIDE, railEdgeOffset(theme, 'full'))};
      }

      @media (min-width: ${theme.breakpoints.xl}) {
        flex-basis: ${railCardWidth(theme, RAIL_COLUMNS_XL, railEdgeOffset(theme, 'full'))};
      }
    }
  }
`,
);
