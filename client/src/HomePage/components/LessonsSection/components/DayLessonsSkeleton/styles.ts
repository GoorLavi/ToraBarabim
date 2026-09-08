import { css } from 'styled-components';

// Static: nothing here moves on a timer. The heading is real text, not a
// placeholder bar (see DayLessonsSkeleton.tsx); the card grid renders
// LessonCardSkeleton, which owns its own shape and colors.
export const DayLessonsSkeleton = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};

  > .title {
    font-size: ${theme.typography.sectionHeading.phone.fontSize};
    line-height: ${theme.typography.sectionHeading.phone.lineHeight};
    font-weight: ${theme.typography.sectionHeading.fontWeight};
    color: ${theme.colors.text};

    @media (min-width: ${theme.breakpoints.md}) {
      font-size: ${theme.typography.sectionHeading.desktop.fontSize};
      line-height: ${theme.typography.sectionHeading.desktop.lineHeight};
    }
  }

  > .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: ${theme.spacing.lg};

    @media (min-width: ${theme.breakpoints.md}) {
      grid-template-columns: repeat(3, 1fr);
    }

    @media (min-width: ${theme.breakpoints.xl}) {
      grid-template-columns: repeat(4, 1fr);
    }
  }
`,
);
