import { css } from 'styled-components';

export const RabbiAccountSection = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  padding-block-start: ${theme.spacing.lg};
  border-block-start: 1px solid ${theme.colors.border};

  > .heading {
    color: ${theme.colors.text};
    font-weight: ${theme.typography.fontWeight.semiBold};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }

  > .note,
  > .state {
    color: ${theme.colors.textSecondary};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }

  > .state.error {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: ${theme.spacing.sm};
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

  > .revealCard {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.lg};
    border: 1px solid ${theme.colors.accent};
    border-radius: ${theme.radii.lg};
    background: ${theme.colors.accentSoft};

    > .heading {
      color: ${theme.colors.text};
      font-weight: ${theme.typography.fontWeight.bold};
      font-size: ${theme.typography.body.phone.fontSize};
      line-height: ${theme.typography.body.phone.lineHeight};
    }

    > .note {
      color: ${theme.colors.text};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }

    > .passwordRow {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: ${theme.spacing.sm};

      > .password {
        padding: ${theme.spacing.sm} ${theme.spacing.md};
        border-radius: ${theme.radii.md};
        background: ${theme.colors.surface};
        border: 1px solid ${theme.colors.border};
        color: ${theme.colors.text};
        font-family: monospace;
        font-size: 20px;
        line-height: 28px;
        letter-spacing: 2px;
        user-select: all;
      }

      > .copy {
        min-block-size: 48px;
        padding-inline: ${theme.spacing.lg};
        border: 1px solid ${theme.colors.primary};
        border-radius: ${theme.radii.pill};
        color: ${theme.colors.primary};
        font-weight: ${theme.typography.fontWeight.semiBold};
      }
    }

    > .dismiss {
      align-self: flex-start;
      min-block-size: 48px;
      padding-inline: ${theme.spacing.lg};
      border-radius: ${theme.radii.pill};
      background: ${theme.colors.primary};
      color: ${theme.colors.textOnPrimary};
      font-weight: ${theme.typography.fontWeight.semiBold};
    }
  }

  > .createForm {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: ${theme.spacing.sm};

    > .field {
      inline-size: 100%;
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
        inline-size: 100%;
        max-inline-size: 320px;
        min-block-size: 48px;
        padding-inline: ${theme.spacing.md};
        border: 1px solid ${theme.colors.border};
        border-radius: ${theme.radii.md};
        background: ${theme.colors.surface};
        color: ${theme.colors.text};
        font-size: ${theme.typography.body.phone.fontSize};
        line-height: ${theme.typography.body.phone.lineHeight};
      }

      > .error {
        color: ${theme.colors.danger};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }
    }

    > .submit {
      min-block-size: 48px;
      padding-inline: ${theme.spacing.lg};
      border-radius: ${theme.radii.pill};
      background: ${theme.colors.primary};
      color: ${theme.colors.textOnPrimary};
      font-weight: ${theme.typography.fontWeight.semiBold};

      &:disabled {
        opacity: 0.6;
      }
    }
  }

  > .accountDetails {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};

    > .row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: ${theme.spacing.sm};

      > .label {
        color: ${theme.colors.textSecondary};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }

      > .value {
        color: ${theme.colors.text};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.body.phone.fontSize};
        line-height: ${theme.typography.body.phone.lineHeight};
      }

      > .statusPill {
        padding-inline: ${theme.spacing.sm};
        border-radius: ${theme.radii.pill};
        background: ${theme.colors.primarySoft};
        color: ${theme.colors.primary};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.tagAndCaption.phone.fontSize};
        line-height: ${theme.typography.tagAndCaption.phone.lineHeight};

        &.inactive {
          background: transparent;
          border: 1px solid ${theme.colors.border};
          color: ${theme.colors.textSecondary};
        }
      }
    }

    > .actions {
      display: flex;
      flex-wrap: wrap;
      gap: ${theme.spacing.sm};

      > button {
        min-block-size: 48px;
        padding-inline: ${theme.spacing.lg};
        border: 1px solid ${theme.colors.border};
        border-radius: ${theme.radii.pill};
        color: ${theme.colors.text};
        font-weight: ${theme.typography.fontWeight.semiBold};

        &:disabled {
          opacity: 0.6;
        }
      }
    }
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

      > .message {
        color: ${theme.colors.textSecondary};
        font-size: ${theme.typography.body.phone.fontSize};
        line-height: ${theme.typography.body.phone.lineHeight};
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
          background: ${theme.colors.primary};
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
