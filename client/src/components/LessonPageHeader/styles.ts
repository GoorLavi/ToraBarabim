import { css } from 'styled-components';

// A reduced variant of HomePage/components/Header: same primary band and
// content width, logo only. The date chips, search field and city picker
// are home-page filters with nothing to filter on a single lesson's page
// (design spec, "Header and the way back").
export const LessonPageHeader = css(
  ({ theme }) => `
  background: ${theme.colors.primary};
  /* 12 + 28 (the logo mark) + 12 = 52 on a phone; 16 + 28 + 16 = 60 on
     desktop (00-shared-shell.md, "Header"). */
  padding-block: ${theme.spacing.md};

  @media (min-width: ${theme.breakpoints.md}) {
    padding-block: ${theme.spacing.lg};
  }

  > .bar {
    /* The band caps at theme.layout.contentMaxWidth (1280) and centres from
       1328px up: a 1280px band plus the 24px gutter on both sides is 1328px,
       so that is the container's own max width, not 1280
       (design-system.md, "Breakpoints and content width"). */
    max-inline-size: calc(${theme.layout.contentMaxWidth} + ${theme.spacing.xl} * 2);
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
