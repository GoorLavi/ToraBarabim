import { css } from 'styled-components';

// Bare, with no card fill and no border, mirroring RabbiListRowSkeleton.
// Static, no timer-driven motion (design-system.md, Feel).
export const PlaceListRowSkeleton = css(
  ({ theme }) => `
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};

  > .thumbnail {
    flex-shrink: 0;
    inline-size: 64px;
    block-size: 36px;
    border-radius: ${theme.radii.sm};
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
      inline-size: 130px;
      block-size: 16px;
      border-radius: ${theme.radii.sm};
      background: ${theme.colors.border};
    }
  }
`,
);
