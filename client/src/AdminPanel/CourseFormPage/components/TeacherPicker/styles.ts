import { css } from 'styled-components';

export const TeacherPicker = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};

  > .modeToggle {
    display: flex;
    gap: ${theme.spacing.sm};

    > .modeOption {
      min-block-size: 40px;
      padding-inline: ${theme.spacing.md};
      border: 1px solid ${theme.colors.border};
      border-radius: ${theme.radii.pill};
      color: ${theme.colors.text};
      font-size: ${theme.typography.tagAndCaption.phone.fontSize};
      line-height: ${theme.typography.tagAndCaption.phone.lineHeight};

      &.selected {
        border-color: ${theme.colors.primary};
        background: ${theme.colors.primarySoft};
        color: ${theme.colors.primary};
        font-weight: ${theme.typography.fontWeight.semiBold};
      }
    }
  }

  > .field {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
    align-items: flex-start;

    > .label {
      color: ${theme.colors.text};
      font-weight: ${theme.typography.fontWeight.semiBold};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }

    > .input {
      inline-size: 100%;
      min-block-size: 48px;
      padding-inline: ${theme.spacing.md};
      border: 1px solid ${theme.colors.border};
      border-radius: ${theme.radii.md};
      background: ${theme.colors.surface};
      color: ${theme.colors.text};
      font-size: ${theme.typography.body.phone.fontSize};
      line-height: ${theme.typography.body.phone.lineHeight};
    }

    > .helper {
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }
  }

  > .error {
    color: ${theme.colors.danger};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }
`,
);
