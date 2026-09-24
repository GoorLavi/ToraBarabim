import { css } from 'styled-components';

export const RabbiSelect = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  align-items: flex-start;

  > .error {
    color: ${theme.colors.danger};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }
`,
);
