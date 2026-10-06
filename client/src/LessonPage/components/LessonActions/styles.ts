import { css } from 'styled-components';

// Equal halves while both labels fit on one line, a stack the moment one no
// longer does: each item never shrinks below its own label, and the row
// wraps on that, never on a breakpoint. From md the items hug their labels.
export const LessonActions = css(
  ({ theme }) => `
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: ${theme.spacing.sm};

  > .share,
  > .calendar {
    flex: 1 1 0;
    min-inline-size: max-content;

    @media (min-width: ${theme.breakpoints.md}) {
      flex: 0 0 auto;
    }
  }

  > .share {
    align-items: stretch;

    @media (min-width: ${theme.breakpoints.md}) {
      align-items: flex-start;
    }
  }

  > .calendar > .icon {
    flex: 0 0 auto;
    block-size: 20px;
    inline-size: 20px;
  }
`,
);
