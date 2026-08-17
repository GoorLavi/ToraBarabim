import { css } from 'styled-components';

export const LoginPage = css(
  ({ theme }) => `
  min-block-size: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.xl};
  padding: ${theme.spacing.lg};

  > .brand {
    display: flex;
    align-items: center;
    gap: ${theme.spacing.sm};

    > .wordmark {
      color: ${theme.colors.primary};
      font-weight: ${theme.typography.fontWeight.bold};
      font-size: ${theme.typography.sectionHeading.phone.fontSize};
      line-height: ${theme.typography.sectionHeading.phone.lineHeight};
    }

    > .badge {
      padding-block: ${theme.spacing.xs};
      padding-inline: ${theme.spacing.sm};
      border-radius: ${theme.radii.pill};
      background: ${theme.colors.primarySoft};
      color: ${theme.colors.primary};
      font-weight: ${theme.typography.fontWeight.semiBold};
      font-size: ${theme.typography.tagAndCaption.phone.fontSize};
      line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
    }
  }

  > .card {
    inline-size: 100%;
    max-inline-size: 400px;
    padding: ${theme.spacing.xl};
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radii.lg};
    background: ${theme.colors.surface};
    box-shadow: ${theme.shadows.raised};

    > .heading {
      color: ${theme.colors.text};
      font-weight: ${theme.typography.pageHeading.fontWeight};
      font-size: ${theme.typography.sectionHeading.phone.fontSize};
      line-height: ${theme.typography.sectionHeading.phone.lineHeight};
    }

    > .subtext {
      margin-block-start: ${theme.spacing.xs};
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }

    > .form {
      margin-block-start: ${theme.spacing.lg};
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.md};

      > .error {
        padding: ${theme.spacing.sm};
        border-radius: ${theme.radii.sm};
        background: ${theme.colors.accentSoft};
        color: ${theme.colors.danger};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }

      > .field {
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

          &:focus {
            outline: 2px solid ${theme.colors.primary};
            outline-offset: 1px;
          }
        }
      }

      > .submit {
        min-block-size: 48px;
        margin-block-start: ${theme.spacing.xs};
        border-radius: ${theme.radii.md};
        background: ${theme.colors.primary};
        color: ${theme.colors.textOnPrimary};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.body.phone.fontSize};
        line-height: ${theme.typography.body.phone.lineHeight};

        &:disabled {
          opacity: 0.6;
          cursor: default;
        }

        &:not(:disabled):hover {
          background: ${theme.colors.primaryStrong};
        }
      }
    }
  }

  > .forgot {
    max-inline-size: 400px;
    text-align: center;
    color: ${theme.colors.textSecondary};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }
`,
);
