import { css } from 'styled-components';

// Targets `ResponsiveSheet`'s `.panel`, the shell's public slot for a
// sheet's own content (see the comment on that component's styles.ts).
export const MoveOccurrenceSheet = css(
  ({ theme }) => `
  > .panel {
    /* Overrides the shared shell's own scroll/height rule (see the comment
       above this file): this sheet's content can grow past 90vh once the
       place fields and their validation errors are showing, and only the
       form should scroll, never the save button along with it. */
    display: flex;
    flex-direction: column;
    overflow: hidden;

    > .heading {
      flex-shrink: 0;
      color: ${theme.colors.text};
      font-weight: ${theme.typography.fontWeight.bold};
      font-size: ${theme.typography.sectionHeading.phone.fontSize};
      line-height: ${theme.typography.sectionHeading.phone.lineHeight};
    }

    > .form {
      flex: 1;
      min-block-size: 0;
      overflow-y: auto;
      margin-block-start: ${theme.spacing.md};
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.md};

      /* Grouped rather than duplicated: a field inside the "elsewhere"
         group below gets exactly the same label/input/error treatment as
         one directly in the form, not a second, drifting copy of it. */
      > .field,
      > .placeFields > .field {
        display: flex;
        flex-direction: column;
        gap: ${theme.spacing.xs};

        > .label {
          color: ${theme.colors.text};
          font-weight: ${theme.typography.fontWeight.semiBold};
          font-size: ${theme.typography.secondary.phone.fontSize};
          line-height: ${theme.typography.secondary.phone.lineHeight};
        }

        > input {
          min-block-size: 48px;
          padding-inline: ${theme.spacing.md};
          border: 1px solid ${theme.colors.border};
          border-radius: ${theme.radii.md};
          background: ${theme.colors.surface};
          color: ${theme.colors.text};
          font-size: ${theme.typography.body.phone.fontSize};
          line-height: ${theme.typography.body.phone.lineHeight};

          /* A native time input's value sits at its own inline end
             regardless of document direction, stranded across a
             full-width field once every neighbouring field is
             right-aligned. Sizing to content keeps it beside its label
             instead of floating alone. */
          &[type='time'] {
            inline-size: fit-content;
            min-inline-size: 160px;
            text-align: start;
          }
        }

        > .error {
          color: ${theme.colors.danger};
          font-size: ${theme.typography.secondary.phone.fontSize};
          line-height: ${theme.typography.secondary.phone.lineHeight};
        }
      }

      > .toggle {
        display: flex;
        align-items: center;
        gap: ${theme.spacing.sm};
        min-block-size: 48px;
        color: ${theme.colors.text};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.body.phone.fontSize};
        line-height: ${theme.typography.body.phone.lineHeight};

        > input {
          inline-size: 20px;
          block-size: 20px;
          accent-color: ${theme.colors.primary};
        }
      }

      /* An inline-start border rather than a tinted panel: it reads as
         "these fields belong to the toggle above them", which a soft
         background fill on its own does not say. */
      > .placeFields {
        display: flex;
        flex-direction: column;
        gap: ${theme.spacing.md};
        padding-inline-start: ${theme.spacing.md};
        border-inline-start: 2px solid ${theme.colors.primarySoft};
      }

      > .scopeNote {
        color: ${theme.colors.textSecondary};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }

      > .error {
        color: ${theme.colors.danger};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }
    }

    > .actions {
      flex-shrink: 0;
      margin-block-start: ${theme.spacing.xl};
      padding-block-start: ${theme.spacing.md};
      /* Clears the iOS home indicator once the sheet's own bottom padding
         isn't enough: the shared shell's .panel padding covers a plain
         sheet, but this one pins its actions to the true bottom edge. */
      padding-block-end: max(${theme.spacing.md}, env(safe-area-inset-bottom));
      border-block-start: 1px solid ${theme.colors.border};
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.sm};

      > .save {
        min-block-size: 52px;
        border-radius: ${theme.radii.md};
        background: ${theme.colors.primary};
        color: ${theme.colors.textOnPrimary};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.body.phone.fontSize};
        line-height: ${theme.typography.body.phone.lineHeight};

        &:disabled {
          opacity: 0.6;
        }
      }

      > .back {
        min-block-size: 48px;
        color: ${theme.colors.textSecondary};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.body.phone.fontSize};
        line-height: ${theme.typography.body.phone.lineHeight};
      }
    }
  }
`,
);
