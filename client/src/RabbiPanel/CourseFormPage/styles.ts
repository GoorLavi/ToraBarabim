import { css } from 'styled-components';

// Mirrors LessonFormPage/styles.ts's own shape (`.state`, `.breadcrumb`,
// `.section`, `.field`, `.footer`), correcting its one bare `input` selector
// to a `.input` class along the way (client/CLAUDE.md: never target a bare
// HTML element): a form this size, with a checkbox and a textarea beside
// plain inputs, is exactly where a bare selector would start catching the
// wrong elements.
export const CourseFormPage = css(
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
  }

  > .form {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.lg};

    > .heading {
      color: ${theme.colors.text};
      font-weight: ${theme.typography.pageHeading.fontWeight};
      font-size: ${theme.typography.sectionHeading.phone.fontSize};
      line-height: ${theme.typography.sectionHeading.phone.lineHeight};
    }

    > .subtext {
      margin-block-start: -${theme.spacing.md};
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }

    > .generalError {
      padding: ${theme.spacing.sm};
      border-radius: ${theme.radii.sm};
      background: ${theme.colors.accentSoft};
      color: ${theme.colors.danger};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }

    > .section {
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.md};
      padding: ${theme.spacing.lg};
      border: 1px solid ${theme.colors.border};
      border-radius: ${theme.radii.lg};
      background: ${theme.colors.surface};

      > .sectionHeading {
        color: ${theme.colors.text};
        font-weight: ${theme.typography.fontWeight.bold};
        font-size: ${theme.typography.body.phone.fontSize};
        line-height: ${theme.typography.body.phone.lineHeight};
      }

      > .row {
        display: flex;
        flex-wrap: wrap;
        gap: ${theme.spacing.md};

        > .field {
          flex: 1;
          min-inline-size: 140px;
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

        > .input,
        > textarea.input {
          inline-size: 100%;
          min-block-size: 48px;
          padding-inline: ${theme.spacing.md};
          border: 1px solid ${theme.colors.border};
          border-radius: ${theme.radii.md};
          background: ${theme.colors.surface};
          color: ${theme.colors.text};
          font-family: inherit;
          font-size: ${theme.typography.body.phone.fontSize};
          line-height: ${theme.typography.body.phone.lineHeight};
        }

        > textarea.input {
          padding-block: ${theme.spacing.sm};
          min-block-size: 120px;
          resize: vertical;
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

      > .checkboxField {
        display: flex;
        align-items: center;
        gap: ${theme.spacing.sm};

        > .checkbox {
          inline-size: 22px;
          block-size: 22px;
        }

        > .label {
          color: ${theme.colors.text};
          font-size: ${theme.typography.body.phone.fontSize};
          line-height: ${theme.typography.body.phone.lineHeight};
        }
      }

      > .topicChips {
        display: flex;
        flex-wrap: wrap;
        gap: ${theme.spacing.xs};

        > .chip {
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

      > .galleryNote {
        padding: ${theme.spacing.md};
        border-radius: ${theme.radii.sm};
        background: ${theme.colors.primarySoft};
        color: ${theme.colors.text};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }

      > .helper {
        color: ${theme.colors.textSecondary};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }
    }

    > .errorSummary {
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.xs};
      padding: ${theme.spacing.md};
      border: 1px solid ${theme.colors.danger};
      border-radius: ${theme.radii.md};
      background: ${theme.colors.accentSoft};

      > .heading {
        color: ${theme.colors.danger};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.body.phone.fontSize};
        line-height: ${theme.typography.body.phone.lineHeight};
      }

      > .list {
        display: flex;
        flex-direction: column;
        gap: ${theme.spacing.xs};
        padding-inline-start: ${theme.spacing.lg};
        color: ${theme.colors.danger};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }
    }

    > .liveNote {
      padding: ${theme.spacing.md};
      border-radius: ${theme.radii.sm};
      background: ${theme.colors.accentSoft};
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }

    > .footer {
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

      > .cancel {
        min-block-size: 48px;
        color: ${theme.colors.textSecondary};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.body.phone.fontSize};
        line-height: ${theme.typography.body.phone.lineHeight};
      }
    }

    > .dangerZone {
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.sm};
      padding-block-start: ${theme.spacing.lg};
      border-block-start: 1px solid ${theme.colors.border};

      > .heading {
        color: ${theme.colors.textSecondary};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }

      > .action {
        align-self: flex-start;
        min-block-size: 48px;
        color: ${theme.colors.text};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.body.phone.fontSize};
        line-height: ${theme.typography.body.phone.lineHeight};

        &.delete {
          color: ${theme.colors.danger};
        }
      }
    }
  }
`,
);
