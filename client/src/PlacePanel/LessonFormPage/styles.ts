import { css } from 'styled-components';

// Mirrors `RabbiPanel/LessonFormPage/styles.ts`, minus the `.layout`/`.preview`
// split (this form has no live preview card, see the build report) and the
// `.dangerZone` delete button (a place can never delete a lesson, build
// brief).
export const LessonFormPage = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
  max-inline-size: 640px;
  /* Centred inside the panel's own wider band, matching ProfilePage and
     the admin place form (design gate finding F9's fix, carried to this
     screen at round 4). */
  margin-inline: auto;

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

  > .form {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.lg};

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

    > .skeleton {
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.lg};

      > .skeletonSection {
        display: flex;
        flex-direction: column;
        gap: ${theme.spacing.sm};
        padding: ${theme.spacing.lg};
        border: 1px solid ${theme.colors.border};
        border-radius: ${theme.radii.lg};
        background: ${theme.colors.surface};

        > .skeletonLine {
          block-size: 20px;
          border-radius: ${theme.radii.sm};
          background: ${theme.colors.border};

          &.short {
            max-inline-size: 160px;
          }

          &.tall {
            block-size: 48px;
          }
        }
      }
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
      gap: ${theme.spacing.sm};
      padding: ${theme.spacing.lg};
      border: 1px solid ${theme.colors.border};
      border-radius: ${theme.radii.lg};
      background: ${theme.colors.surface};

      > .sectionHeading {
        color: ${theme.colors.text};
        font-weight: ${theme.typography.sectionHeading.fontWeight};
        font-size: ${theme.typography.sectionHeading.phone.fontSize};
        line-height: ${theme.typography.sectionHeading.phone.lineHeight};

        @media (min-width: ${theme.breakpoints.md}) {
          font-size: ${theme.typography.sectionHeading.desktop.fontSize};
          line-height: ${theme.typography.sectionHeading.desktop.lineHeight};
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

        > input,
        > select,
        > textarea {
          inline-size: 100%;
          padding-inline: ${theme.spacing.md};
          border: 1px solid ${theme.colors.border};
          border-radius: ${theme.radii.md};
          background: ${theme.colors.surface};
          color: ${theme.colors.text};
          font-size: ${theme.typography.body.phone.fontSize};
          line-height: ${theme.typography.body.phone.lineHeight};
        }

        > input,
        > select {
          min-block-size: 48px;
        }

        > textarea {
          min-block-size: 96px;
          padding-block: ${theme.spacing.sm};
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
    }
  }
`,
);
