import { css } from 'styled-components';

export const ErrorBoundary = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  padding-block: ${theme.spacing.xxl};
  padding-inline: ${theme.spacing.md};
  text-align: center;

  > .message {
    color: ${theme.colors.danger};
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};
  }

  > .reload {
    padding-block: ${theme.spacing.sm};
    padding-inline: ${theme.spacing.lg};
    border-radius: ${theme.radii.md};
    background: ${theme.colors.primary};
    color: ${theme.colors.textOnPrimary};
    font-weight: ${theme.typography.fontWeight.semiBold};
  }
`,
);
