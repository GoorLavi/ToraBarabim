import { css } from 'styled-components';

export const ThemeSwitcher = css(
  ({ theme }) => `
  position: fixed;
  inset-block-end: ${theme.spacing.md};
  inset-inline-end: ${theme.spacing.md};
  z-index: 999;
  display: flex;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs};
  border: 1px dashed ${theme.colors.border};
  border-radius: ${theme.radii.md};
  background: ${theme.colors.surface};
  box-shadow: ${theme.shadows.raised};

  > .option {
    padding-block: ${theme.spacing.xs};
    padding-inline: ${theme.spacing.sm};
    border-radius: ${theme.radii.sm};
    background: transparent;
    color: ${theme.colors.textSecondary};
    font-size: ${theme.typography.tagAndCaption.phone.fontSize};
    line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
    font-weight: ${theme.typography.fontWeight.semiBold};

    &.selected {
      background: ${theme.colors.primarySoft};
      color: ${theme.colors.primary};
    }
  }
`,
);
