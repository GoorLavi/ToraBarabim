import { css } from 'styled-components';

// Caps at 640 even inside the 880 desktop content column, like every other
// block of running text on the site (design-system.md, "Breakpoints and
// content width").
export const LessonDetails = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
  max-inline-size: 640px;

  > .section {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};

    > .heading {
      font-size: ${theme.typography.sectionHeading.phone.fontSize};
      line-height: ${theme.typography.sectionHeading.phone.lineHeight};
      font-weight: ${theme.typography.sectionHeading.fontWeight};
      color: ${theme.colors.text};
    }

    > .text {
      font-size: ${theme.typography.body.phone.fontSize};
      line-height: ${theme.typography.body.phone.lineHeight};
      color: ${theme.colors.text};
      white-space: pre-line;
    }
  }

  /* The note is about this date, not about the rabbi: the cream band is what
     keeps it from reading as more of the bio above it. */
  > .noteSection {
    padding: ${theme.spacing.lg};
    border-radius: ${theme.radii.lg};
    background: ${theme.colors.accentSoft};
  }
`,
);
