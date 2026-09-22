import { css } from 'styled-components';

// Mirrors `RabbiFormPage/styles.ts`'s form shell (field, honorific-style
// pill picker, footer) plus this form's own additions: a second pill picker
// reused for type/honorific/gender, a date row, and the live-preview field.
export const DedicationFormPage = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};

  > .state {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.xl};
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radii.lg};
    background: ${theme.colors.surface};
    color: ${theme.colors.textSecondary};

    &.error > .message {
      color: ${theme.colors.danger};
    }

    > .retry {
      min-block-size: 48px;
      padding-inline: ${theme.spacing.lg};
      border-radius: ${theme.radii.pill};
      background: ${theme.colors.primary};
      color: ${theme.colors.textOnPrimary};
      font-weight: ${theme.typography.fontWeight.semiBold};
    }
  }

  > .breadcrumb {
    align-self: flex-start;
    display: flex;
    align-items: center;
    min-block-size: 48px;
    color: ${theme.colors.primary};
    font-weight: ${theme.typography.fontWeight.semiBold};
    text-decoration: none;

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        text-decoration: underline;
      }
    }

    &:focus-visible {
      text-decoration: underline;
    }
  }

  > .layout {
    display: flex;
    flex-direction: column-reverse;
    gap: ${theme.spacing.xl};

    @media (min-width: ${theme.breakpoints.lg}) {
      flex-direction: row-reverse;
      align-items: flex-start;

      > .form {
        flex: 2;
      }

      > .preview {
        flex: 1;
        position: sticky;
        inset-block-start: ${theme.spacing.lg};
      }
    }

    > .form {
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.lg};
      padding: ${theme.spacing.lg};
      border: 1px solid ${theme.colors.border};
      border-radius: ${theme.radii.lg};
      background: ${theme.colors.surface};

      > .heading {
        color: ${theme.colors.text};
        font-weight: ${theme.typography.pageHeading.fontWeight};
        font-size: ${theme.typography.pageHeading.phone.fontSize};
        line-height: ${theme.typography.pageHeading.phone.lineHeight};

        @media (min-width: ${theme.breakpoints.md}) {
          font-size: ${theme.typography.pageHeading.desktop.fontSize};
          line-height: ${theme.typography.pageHeading.desktop.lineHeight};
        }
      }

      > .subtext {
        color: ${theme.colors.textSecondary};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
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

        > .pillPicker {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: ${theme.spacing.sm};

          > .pill {
            min-block-size: 48px;
            padding-inline: ${theme.spacing.lg};
            border: 1px solid ${theme.colors.border};
            border-radius: ${theme.radii.pill};
            background: ${theme.colors.surface};
            color: ${theme.colors.text};
            font-size: ${theme.typography.body.phone.fontSize};
            line-height: ${theme.typography.body.phone.lineHeight};

            &.selected {
              border-color: ${theme.colors.primary};
              background: ${theme.colors.primary};
              color: ${theme.colors.textOnPrimary};
              font-weight: ${theme.typography.fontWeight.semiBold};
            }
          }
        }

        > input,
        > select {
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

      > .helper.standalone {
        margin-block-start: -${theme.spacing.sm};
        color: ${theme.colors.textSecondary};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }

      > .dateRow {
        display: flex;
        flex-direction: column;
        gap: ${theme.spacing.md};

        @media (min-width: ${theme.breakpoints.sm}) {
          flex-direction: row;

          > .field {
            flex: 1;
          }
        }
      }

      > .formError {
        color: ${theme.colors.danger};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }

      > .footer {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: ${theme.spacing.md};

        > .cancel {
          display: flex;
          align-items: center;
          min-block-size: 48px;
          color: ${theme.colors.textSecondary};
          font-weight: ${theme.typography.fontWeight.semiBold};
          text-decoration: none;

          @media (hover: hover) and (pointer: fine) {
            &:hover {
              text-decoration: underline;
            }
          }

          &:focus-visible {
            text-decoration: underline;
          }
        }

        > .save {
          min-block-size: 48px;
          padding-inline: ${theme.spacing.xl};
          border-radius: ${theme.radii.pill};
          background: ${theme.colors.primary};
          color: ${theme.colors.textOnPrimary};
          font-weight: ${theme.typography.fontWeight.semiBold};

          &:disabled {
            opacity: 0.6;
          }
        }
      }
    }

    > .preview {
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.sm};

      > .previewLabel {
        color: ${theme.colors.textSecondary};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.tagAndCaption.phone.fontSize};
        line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
      }

      > .previewField {
        display: flex;
        align-items: center;
        justify-content: center;
        min-block-size: 200px;
        padding: ${theme.spacing.xl};
        border: 1px solid ${theme.colors.border};
        border-radius: ${theme.radii.lg};
        background: ${theme.colors.bg};

        > .previewNote {
          max-inline-size: 240px;
          text-align: center;
          color: ${theme.colors.textSecondary};
          font-size: ${theme.typography.secondary.phone.fontSize};
          line-height: ${theme.typography.secondary.phone.lineHeight};

          &.error {
            color: ${theme.colors.danger};
          }
        }
      }
    }
  }
`,
);
