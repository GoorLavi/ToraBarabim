import { css } from 'styled-components';

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

  > .layout {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xl};

    > .preview {
      display: none;
    }

    @media (min-width: ${theme.breakpoints.lg}) {
      flex-direction: row;
      align-items: flex-start;

      > .main {
        flex: 0 0 640px;
        max-inline-size: 640px;
      }

      > .preview {
        display: block;
        flex: 1;
        position: sticky;
        inset-block-start: ${theme.spacing.lg};
      }
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

      > .generalError {
        padding: ${theme.spacing.sm};
        border-radius: ${theme.radii.sm};
        background: ${theme.colors.accentSoft};
        color: ${theme.colors.danger};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }

      > .teacherSection {
        display: flex;
        flex-direction: column;
        gap: ${theme.spacing.sm};
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

        > .sectionHelp {
          color: ${theme.colors.textSecondary};
          font-size: ${theme.typography.secondary.phone.fontSize};
          line-height: ${theme.typography.secondary.phone.lineHeight};
        }
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
    }
  }
`,
);
