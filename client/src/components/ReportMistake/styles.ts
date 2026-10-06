import { css } from 'styled-components';

// One line that is one 48px target. The lead steps back to secondary text so
// the action, not the question, is what the eye lands on.
export const ReportMistake = css(
  ({ theme }) => `
  display: flex;

  > .trigger {
    min-block-size: 48px;
    padding-block: ${theme.spacing.md};
    padding-inline: 0;
    text-align: start;
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};

    &:focus-visible {
      outline: 2px solid ${theme.colors.primary};
      outline-offset: 2px;
      border-radius: ${theme.radii.sm};
    }

    > .lead {
      color: ${theme.colors.textSecondary};
    }

    > .action {
      color: ${theme.colors.primary};
      font-weight: ${theme.typography.fontWeight.semiBold};
      text-decoration: underline;
    }

    &:hover > .action,
    &:active > .action {
      color: ${theme.colors.primaryStrong};
    }
  }
`,
);
