import { css } from 'styled-components';

export const TeacherPicker = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};

  > .triggerRow {
    display: flex;
    align-items: flex-start;
    gap: ${theme.spacing.sm};

    /* The trigger's own fullWidth class (SearchSelect/styles.ts) sets a
       plain 100% width, meant for sitting alone: shared with the clear
       button here, it grows and shrinks in the row instead. */
    > .fullWidth {
      flex: 1;
      min-inline-size: 0;
    }

    > .clearSelection {
      flex: 0 0 auto;
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
