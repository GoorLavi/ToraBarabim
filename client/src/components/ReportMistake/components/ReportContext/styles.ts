import { css } from 'styled-components';

export const ReportContext = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.md};
  border-radius: ${theme.radii.sm};
  background: ${theme.colors.bg};

  > .label {
    color: ${theme.colors.textSecondary};
    font-weight: ${theme.typography.fontWeight.semiBold};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }

  > .line {
    color: ${theme.colors.text};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
    overflow-wrap: anywhere;
  }
`,
);
