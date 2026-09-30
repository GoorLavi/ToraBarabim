import { css } from 'styled-components';

// Mirrors RabbiPanel/LessonFormPage/components/DeleteLessonSheet/styles.ts's
// own shape, generalized for a confirm button that is not always the
// danger color (close and full are `primary`, delete is `danger`).
export const CourseConfirmSheet = css(
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
      color: ${theme.colors.text};
      font-size: ${theme.typography.body.phone.fontSize};
      line-height: ${theme.typography.body.phone.lineHeight};

      > .name {
        font-weight: ${theme.typography.fontWeight.bold};
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

      > .confirm {
        min-block-size: 52px;
        border-radius: ${theme.radii.md};
        color: ${theme.colors.textOnPrimary};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.body.phone.fontSize};
        line-height: ${theme.typography.body.phone.lineHeight};

        &.primary {
          background: ${theme.colors.primary};
        }

        &.danger {
          background: ${theme.colors.danger};
        }

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
