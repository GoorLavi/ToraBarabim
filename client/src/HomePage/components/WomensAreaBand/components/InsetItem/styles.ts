import { css } from 'styled-components';

export const InsetItem = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xs};
  text-align: center;

  > .icon {
    color: ${theme.colors.primary};
    inline-size: 20px;
    block-size: 20px;
  }

  > .label {
    color: ${theme.colors.text};
    font-weight: ${theme.typography.fontWeight.semiBold};
    font-size: ${theme.typography.secondaryCompact.phone.fontSize};
    line-height: ${theme.typography.secondaryCompact.phone.lineHeight};
  }
`,
);
