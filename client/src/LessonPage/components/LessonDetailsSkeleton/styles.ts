import { css } from 'styled-components';

export const LessonDetailsSkeleton = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  max-inline-size: 640px;

  > .bar {
    display: block;
    inline-size: 40%;
    block-size: 20px;
    border-radius: ${theme.radii.sm};
    background: ${theme.colors.border};

    &.wide {
      inline-size: 60%;
    }

    &.narrow {
      inline-size: 25%;
    }
  }
`,
);
