import { css } from 'styled-components';

// Bare, with no card fill and no border, so the loading list reads lighter
// than the loaded one, as drawn in frame 94:73. Static, no timer-driven
// motion (design-system.md, Feel).
export const RabbiListRowSkeleton = css(
  ({ theme }) => `
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};

  > .avatar {
    flex-shrink: 0;
    inline-size: 56px;
    block-size: 56px;
    border-radius: ${theme.radii.pill};
    background: ${theme.colors.border};
  }

  > .text {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};

    > .nameBar {
      inline-size: 170px;
      block-size: 20px;
      border-radius: ${theme.radii.sm};
      background: ${theme.colors.border};
    }

    > .metaBar {
      inline-size: 120px;
      block-size: 16px;
      border-radius: ${theme.radii.sm};
      background: ${theme.colors.border};
    }
  }
`,
);
