import { css } from 'styled-components';

// A reduced variant of HomePage/components/Header: same primary band and
// content width, logo only. The date chips, search field and city picker
// are home-page filters with nothing to filter on a single lesson's page
// (design spec, "Header and the way back").
export const LessonPageHeader = css(
  ({ theme }) => `
  background: ${theme.colors.primary};
  padding-block: ${theme.spacing.lg};

  > .bar {
    max-inline-size: 1120px;
    margin-inline: auto;
    padding-inline: ${theme.spacing.lg};

    @media (min-width: ${theme.breakpoints.md}) {
      padding-inline: ${theme.spacing.xl};
    }

    > .logo {
      display: flex;
      align-items: center;
      gap: ${theme.spacing.sm};
      min-block-size: 48px;
      inline-size: fit-content;
      border-radius: ${theme.radii.sm};
      color: ${theme.colors.textOnPrimary};
      text-decoration: none;

      &:hover,
      &:active {
        opacity: 0.9;
      }

      &:focus-visible {
        outline: 2px solid ${theme.colors.textOnPrimary};
        outline-offset: 2px;
      }

      > .wordmark {
        font-weight: ${theme.typography.fontWeight.bold};
        font-size: ${theme.typography.sectionHeading.phone.fontSize};
        line-height: ${theme.typography.sectionHeading.phone.lineHeight};
      }
    }
  }
`,
);
