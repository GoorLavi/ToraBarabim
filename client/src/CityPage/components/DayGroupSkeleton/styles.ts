import { css } from 'styled-components';

export const DayGroupSkeleton = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};

  > .bar.heading {
    inline-size: 160px;
    block-size: 28px;
    border-radius: ${theme.radii.sm};
    background: ${theme.colors.border};
  }

  > .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: ${theme.spacing.md};

    @media (min-width: ${theme.breakpoints.md}) {
      grid-template-columns: repeat(3, 1fr);
      gap: ${theme.spacing.lg};
    }

    @media (min-width: ${theme.breakpoints.xl}) {
      grid-template-columns: repeat(4, 1fr);
    }
  }
`,
);
