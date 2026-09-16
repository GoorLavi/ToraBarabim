import { css } from 'styled-components';

export const RabbiRailSkeleton = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};

  > .bar.heading {
    inline-size: 150px;
    block-size: 28px;
    border-radius: ${theme.radii.sm};
    background: ${theme.colors.border};
  }

  > .circles {
    display: flex;
    gap: ${theme.spacing.md};

    > .circle {
      inline-size: 64px;
      block-size: 64px;
      border-radius: ${theme.radii.pill};
      background: ${theme.colors.border};
      flex-shrink: 0;
    }
  }
`,
);
