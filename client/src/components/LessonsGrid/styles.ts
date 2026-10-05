import { css } from 'styled-components';

import { GRID_CARD_WIDTH_DESKTOP } from './consts';

// Two columns below md (design-system.md, "The lesson grid steps").
// min-inline-size: 0 guards against a grid item's default min-width: auto,
// which would let a long unbreakable string push its column past its
// track.
//
// From md up the card is fixed at its sitewide ceiling
// (GRID_CARD_WIDTH_DESKTOP) rather than stepped through a column-count
// breakpoint ladder: auto-fill lays down as many fixed-width tracks as the
// available width holds, so the column count grows with the viewport
// instead of the card growing with it (owner-approved reversal, for lesson
// grids, of the sitewide "cards grow, margins don't" cap; design-system.md,
// "Whether the card's ceiling at the widest widths should come down from
// 308"). auto-fit was considered and is equivalent here: with a fixed,
// non-fractional track size and justify-content: start, an unfilled
// trailing track is invisible either way, since there is nothing to
// stretch into the space it would otherwise collapse.
export const LessonsGrid = css(
  ({ theme }) => `
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing.lg};

  @media (min-width: ${theme.breakpoints.md}) {
    grid-template-columns: repeat(auto-fill, ${GRID_CARD_WIDTH_DESKTOP});
    justify-content: start;
  }

  > .cell {
    display: grid;
    min-inline-size: 0;
  }
`,
);
