import { css } from 'styled-components';

// Two columns below `md`, three from `md` to `xl`, four from `xl` up
// (08-content-width-1280.md, "The lesson grid steps"). `align-items: start`
// keeps every card at its own height and top-aligned within the row: two
// cards of different heights in the same row is the accepted, measured
// behaviour for this round (05-lessons.md, "The grid"), not a defect to
// stretch away.
export const LessonsGrid = css(
  ({ theme }) => `
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  align-items: start;
  gap: ${theme.spacing.md};

  @media (min-width: ${theme.breakpoints.md}) {
    grid-template-columns: repeat(3, 1fr);
    gap: ${theme.spacing.lg};
  }

  @media (min-width: ${theme.breakpoints.xl}) {
    grid-template-columns: repeat(4, 1fr);
  }

  > .cell {
    min-inline-size: 0;
  }
`,
);
