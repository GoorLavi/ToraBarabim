import { css } from 'styled-components';

// A reading page, capped narrower than the site's usual 1280, the same
// reasoning LessonPage/styles.ts gives for its own 880 band.
export const CoursePage = css(
  ({ theme }) => `
  max-inline-size: calc(880px + ${theme.spacing.xl} * 2);
  inline-size: 100%;
  margin-inline: auto;
  padding-inline: ${theme.spacing.lg};
  padding-block: ${theme.spacing.lg};
  /* Clears the fixed ContactBar/ClosedPanel action on a phone, so the
     page's own last section is never hidden behind it. Not needed from xl
     up, where ContactBar returns to the page's own flow. */
  padding-block-end: 96px;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};

  @media (min-width: ${theme.breakpoints.md}) {
    padding-inline: ${theme.spacing.xl};
    padding-block: ${theme.spacing.xl};
  }

  @media (min-width: ${theme.breakpoints.xl}) {
    padding-block-end: ${theme.spacing.xl};
  }

  > .heading {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};

    > .title {
      font-size: ${theme.typography.pageHeading.phone.fontSize};
      line-height: ${theme.typography.pageHeading.phone.lineHeight};
      font-weight: ${theme.typography.pageHeading.fontWeight};
      color: ${theme.colors.text};

      @media (min-width: ${theme.breakpoints.md}) {
        font-size: ${theme.typography.pageHeading.desktop.fontSize};
        line-height: ${theme.typography.pageHeading.desktop.lineHeight};
      }
    }

    > .tags {
      display: flex;
      gap: ${theme.spacing.xs};

      > .tag {
        display: inline-flex;
        align-items: center;
        padding-block: 2px;
        padding-inline: ${theme.spacing.xs};
        border: 1px solid ${theme.colors.primary};
        border-radius: ${theme.radii.sm};
        background: ${theme.colors.primarySoft};
        color: ${theme.colors.primary};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.tagAndCaption.phone.fontSize};
        line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
      }
    }
  }

  > .description {
    color: ${theme.colors.text};
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};
    white-space: pre-wrap;
  }
`,
);
