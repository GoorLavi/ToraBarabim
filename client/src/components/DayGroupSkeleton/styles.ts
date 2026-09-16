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
`,
);
