import { css } from 'styled-components';

// Static, no timer-driven motion (design-system.md, Feel). Shaped like the
// real page (a square gallery, a heading bar, facts bars) rather than a
// generic block.
export const CoursePageSkeleton = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};

  > .gallery {
    aspect-ratio: 1;
    border-radius: ${theme.radii.lg};
    background: ${theme.colors.primarySoft};
  }

  > .bar {
    block-size: 18px;
    border-radius: ${theme.radii.sm};
    background: ${theme.colors.border};
  }

  > .bar.title {
    inline-size: 70%;
    block-size: 28px;
  }

  > .bar.wide {
    inline-size: 100%;
  }

  > .bar.narrow {
    inline-size: 40%;
  }
`,
);
