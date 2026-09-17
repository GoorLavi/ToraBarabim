import { css } from 'styled-components';

// Targets `ResponsiveSheet`'s `.panel`, the shell's public slot for a
// sheet's own content (see the comment on that component's styles.ts).
export const CancelExceptionSheet = css(
  ({ theme }) => `
  > .panel {
    > .heading {
      color: ${theme.colors.text};
      font-weight: ${theme.typography.fontWeight.bold};
      font-size: ${theme.typography.sectionHeading.phone.fontSize};
      line-height: ${theme.typography.sectionHeading.phone.lineHeight};
    }

    > .body {
      margin-block-start: ${theme.spacing.md};
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.body.phone.fontSize};
      line-height: ${theme.typography.body.phone.lineHeight};
    }

    > .field {
      margin-block-start: ${theme.spacing.md};
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.xs};

      > .label {
        color: ${theme.colors.text};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }

      > textarea {
        resize: vertical;
        padding: ${theme.spacing.sm} ${theme.spacing.md};
        border: 1px solid ${theme.colors.border};
        border-radius: ${theme.radii.md};
        background: ${theme.colors.surface};
        color: ${theme.colors.text};
        font-family: inherit;
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
      margin-block-start: ${theme.spacing.sm};
      color: ${theme.colors.danger};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }

    > .actions {
      margin-block-start: ${theme.spacing.xl};
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.sm};

      /* Mirrors LessonFormPage and RabbiFormPage's own DiscardChangesSheet,
         the panel's existing answer to a safe-versus-destructive confirm:
         the safe choice (back, staying as is) is the filled, dominant
         button; the destructive one (confirm, cancelling the date) is a
         bordered ghost in danger text, never a danger fill
         (design-system.md's color token table: danger is text only). */
      > .confirm {
        min-block-size: 48px;
        border: 1px solid ${theme.colors.danger};
        border-radius: ${theme.radii.md};
        color: ${theme.colors.danger};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.body.phone.fontSize};
        line-height: ${theme.typography.body.phone.lineHeight};

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }

      > .back {
        min-block-size: 48px;
        border-radius: ${theme.radii.md};
        background: ${theme.colors.primary};
        color: ${theme.colors.textOnPrimary};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.body.phone.fontSize};
        line-height: ${theme.typography.body.phone.lineHeight};

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }
    }
  }
`,
);
