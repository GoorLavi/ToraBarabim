import { css } from 'styled-components';

import { ROW_PADDING_BLOCK } from '../PlaceListRow/consts';

// Draws the loaded row's own card surface, border, radius and padding
// instead of a bare flat block: a skeleton with no card underneath it reads
// as a different, shorter component and the list roughly doubles in height
// once the real rows land (design gate finding F5). Static, no timer-driven
// motion (design-system.md, Feel).
export const PlaceListRowSkeleton = css(
  ({ theme }) => `
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding-block: ${ROW_PADDING_BLOCK};
  padding-inline: ${theme.spacing.lg};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.surface};

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
