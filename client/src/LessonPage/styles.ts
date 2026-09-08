import { css } from 'styled-components';

// A reading page, not a dashboard: the content column caps at 880, not the
// site's usual 1120 (design spec, "Desktop").
export const LessonPage = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  min-block-size: 100%;

  > .content {
    max-inline-size: 880px;
    inline-size: 100%;
    margin-inline: auto;
    padding-inline: ${theme.spacing.lg};
    padding-block: ${theme.spacing.lg};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xl};

    @media (min-width: ${theme.breakpoints.md}) {
      padding-inline: ${theme.spacing.xl};
      padding-block: ${theme.spacing.xl};
    }

    > .otherLessons {
      align-self: flex-start;
      min-block-size: 48px;
      display: inline-flex;
      align-items: center;
      gap: ${theme.spacing.xs};
      color: ${theme.colors.primary};
      font-weight: ${theme.typography.fontWeight.semiBold};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
      text-decoration: none;

      &:hover,
      &:active {
        color: ${theme.colors.primaryStrong};
      }

      &:focus-visible {
        outline: 2px solid ${theme.colors.primary};
        outline-offset: 2px;
        border-radius: ${theme.radii.sm};
      }

      > .chevron {
        inline-size: 20px;
        block-size: 20px;
      }
    }
  }
`,
);
