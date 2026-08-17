import { css } from 'styled-components';

export const DeleteRabbiButton = css(
  ({ theme }) => `
  > .deleteTrigger {
    min-block-size: 48px;
    padding-inline: ${theme.spacing.lg};
    border: 1px solid ${theme.colors.danger};
    border-radius: ${theme.radii.pill};
    color: ${theme.colors.danger};
    font-weight: ${theme.typography.fontWeight.semiBold};
  }

  > .overlay {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing.lg};
    background: rgba(28, 26, 23, 0.5);

    > .dialog {
      inline-size: 100%;
      max-inline-size: 420px;
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.sm};
      padding: ${theme.spacing.xl};
      border-radius: ${theme.radii.lg};
      background: ${theme.colors.surface};
      box-shadow: ${theme.shadows.raised};

      > .heading {
        color: ${theme.colors.text};
        font-weight: ${theme.typography.fontWeight.bold};
        font-size: ${theme.typography.sectionHeading.phone.fontSize};
        line-height: ${theme.typography.sectionHeading.phone.lineHeight};
      }

      > .message {
        color: ${theme.colors.textSecondary};
        font-size: ${theme.typography.body.phone.fontSize};
        line-height: ${theme.typography.body.phone.lineHeight};

        &.error {
          color: ${theme.colors.danger};
        }
      }

      > .irreversible {
        color: ${theme.colors.danger};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }

      > .actions {
        display: flex;
        justify-content: flex-end;
        gap: ${theme.spacing.sm};
        margin-block-start: ${theme.spacing.sm};

        > .cancel {
          min-block-size: 48px;
          padding-inline: ${theme.spacing.lg};
          border-radius: ${theme.radii.pill};
          color: ${theme.colors.text};
        }

        > .confirm {
          min-block-size: 48px;
          padding-inline: ${theme.spacing.lg};
          border-radius: ${theme.radii.pill};
          background: ${theme.colors.danger};
          color: ${theme.colors.textOnPrimary};
          font-weight: ${theme.typography.fontWeight.semiBold};

          &:disabled {
            opacity: 0.6;
          }
        }
      }
    }
  }
`,
);
