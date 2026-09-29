import { css } from 'styled-components';

export const OrDivider = css(
  ({ theme }) => `
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding-block: ${theme.spacing.xs};

  > .line {
    flex: 1;
    block-size: 1px;
    background: ${theme.colors.border};
  }

  > .label {
    color: ${theme.colors.textSecondary};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }
`,
);
