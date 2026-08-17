import { css } from 'styled-components';

export const RabbiFormPage = css(
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
        font-size: ${theme.typography.sectionHeading.phone.fontSize};
        line-height: ${theme.typography.sectionHeading.phone.lineHeight};

        @media (min-width: ${theme.breakpoints.md}) {
          font-size: ${theme.typography.pageHeading.phone.fontSize};
          line-height: ${theme.typography.pageHeading.phone.lineHeight};
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

        > input {
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
        }

        > .saveAndAddLesson {
          min-block-size: 48px;
          padding-inline: ${theme.spacing.lg};
          border: 1px solid ${theme.colors.primary};
          border-radius: ${theme.radii.pill};
          color: ${theme.colors.primary};
          font-weight: ${theme.typography.fontWeight.semiBold};

          &:disabled {
            opacity: 0.6;
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

      > .dangerZone {
        padding-block-start: ${theme.spacing.lg};
        border-block-start: 1px solid ${theme.colors.border};
      }
    }
  }
`,
);
