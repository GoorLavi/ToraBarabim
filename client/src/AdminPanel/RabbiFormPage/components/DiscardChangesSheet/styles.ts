import { css } from 'styled-components';

// Targets `ResponsiveSheet`'s `.panel`, the shell's public slot for a
// sheet's own content (see the comment on that component's styles.ts).
// Token-for-token the same shape as `RabbiPanel/UpcomingPage`'s
// `CancelOccurrenceSheet`.
export const DiscardChangesSheet = css(
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

    > .actions {
      margin-block-start: ${theme.spacing.xl};
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.sm};

      /* The safe choice (staying in the form) is the filled, dominant
         button; the destructive one (leaving without saving) is a bordered
         ghost in danger text, never a danger fill (design-system.md,
         color token table: danger is text only). */
      > .back {
        min-block-size: 48px;
        border-radius: ${theme.radii.md};
        background: ${theme.colors.primary};
        color: ${theme.colors.textOnPrimary};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.body.phone.fontSize};
        line-height: ${theme.typography.body.phone.lineHeight};
      }

      > .confirm {
        min-block-size: 48px;
        border: 1px solid ${theme.colors.danger};
        border-radius: ${theme.radii.md};
        color: ${theme.colors.danger};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.body.phone.fontSize};
        line-height: ${theme.typography.body.phone.lineHeight};
      }
    }
  }
`,
);
