import { css } from 'styled-components';

export const NotFoundScreen = css(
  ({ theme }) => `
  display: flex;
  justify-content: center;
  padding-block: ${theme.spacing.xxl};

  > .card {
    inline-size: 100%;
    max-inline-size: 480px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.xl};
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radii.lg};
    background: ${theme.colors.surface};
    box-shadow: ${theme.shadows.card};
    text-align: start;

    > .heading {
      font-size: ${theme.typography.sectionHeading.phone.fontSize};
      line-height: ${theme.typography.sectionHeading.phone.lineHeight};
      font-weight: ${theme.typography.sectionHeading.fontWeight};
      color: ${theme.colors.text};
    }

    > .explanation {
      font-size: ${theme.typography.body.phone.fontSize};
      line-height: ${theme.typography.body.phone.lineHeight};
      color: ${theme.colors.textSecondary};
    }

    > .action {
      inline-size: fit-content;
      min-block-size: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding-inline: ${theme.spacing.lg};
      border: none;
      border-radius: ${theme.radii.md};
      background: ${theme.colors.primary};
      color: ${theme.colors.textOnPrimary};
      font-weight: ${theme.typography.fontWeight.semiBold};
      font-size: ${theme.typography.body.phone.fontSize};
      line-height: ${theme.typography.body.phone.lineHeight};
      text-decoration: none;
      cursor: pointer;

      &:hover,
      &:active {
        background: ${theme.colors.primaryStrong};
      }

      &:focus-visible {
        outline: 2px solid ${theme.colors.primary};
        outline-offset: 2px;
      }
    }
  }
`,
);
