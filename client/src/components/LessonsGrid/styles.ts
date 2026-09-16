import { css } from 'styled-components';

// Two columns below `md`, three from `md` to `xl`, four from `xl` up
// (.claude/design-system.md, "The lesson grid steps"). `min-inline-size: 0`
// guards against a grid item's default `min-width: auto`, which would let a
// long unbreakable string push its column past its track.
export const LessonsGrid = css(
  ({ theme }) => `
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing.lg};

  @media (min-width: ${theme.breakpoints.md}) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: ${theme.breakpoints.xl}) {
    grid-template-columns: repeat(4, 1fr);
  }

  > .cell {
    display: grid;
    min-inline-size: 0;
  }
`,
);
