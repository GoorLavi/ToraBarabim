import { css } from 'styled-components';

export const Footer = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${theme.spacing.md};
  padding-block: ${theme.spacing.xl};
  border-block-start: 1px solid ${theme.colors.border};

  > .wordmark {
    color: ${theme.colors.text};
    font-weight: ${theme.typography.fontWeight.bold};
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};
  }

  > .links {
    display: flex;
    gap: ${theme.spacing.lg};
    color: ${theme.colors.textSecondary};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }
`,
);
