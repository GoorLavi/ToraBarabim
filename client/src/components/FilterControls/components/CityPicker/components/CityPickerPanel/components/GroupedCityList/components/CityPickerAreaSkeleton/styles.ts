import { css } from 'styled-components';

// Static, no timer-driven motion (design-system.md, Feel).
export const CityPickerAreaSkeleton = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};

  > .captionBar {
    inline-size: 96px;
    block-size: 20px;
    border-radius: ${theme.radii.sm};
    background: ${theme.colors.primarySoft};
  }

  > .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: ${theme.spacing.md};

    > .cell {
      block-size: 64px;
      border-radius: ${theme.radii.md};
      background: ${theme.colors.primarySoft};
    }
  }
`,
);
