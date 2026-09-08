import { css } from 'styled-components';

export const AdminCard = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.surface};
  box-shadow: ${theme.shadows.card};

  @media (min-width: ${theme.breakpoints.md}) {
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: ${theme.spacing.lg};
  }

  > .body {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};

    @media (min-width: ${theme.breakpoints.md}) {
      flex: 0 1 480px;
      min-inline-size: 0;
    }

    > .name {
      color: ${theme.colors.text};
      font-weight: ${theme.typography.cardTitle.fontWeight};
      font-size: ${theme.typography.cardTitle.phone.fontSize};
      line-height: ${theme.typography.cardTitle.phone.lineHeight};
      overflow-wrap: break-word;
    }

    > .email,
    > .username {
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
      overflow-wrap: break-word;
    }

    > .statusPill {
      align-self: flex-start;
      margin-block-start: ${theme.spacing.xs};
      padding-block: ${theme.spacing.xs};
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
    align-items: center;
    gap: ${theme.spacing.sm};

    @media (min-width: ${theme.breakpoints.md}) {
      flex: 0 0 auto;
    }

    > button {
      min-block-size: 48px;
      padding-inline: ${theme.spacing.lg};
      border: 1px solid ${theme.colors.border};
      border-radius: ${theme.radii.pill};
      color: ${theme.colors.text};
      font-weight: ${theme.typography.fontWeight.semiBold};

      &.danger {
        color: ${theme.colors.danger};
      }

      &:disabled {
        opacity: 0.6;
      }
    }

    > .note {
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }

    > .error {
      inline-size: 100%;
      color: ${theme.colors.danger};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
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
    overflow-y: auto;
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
        font-size: ${theme.typography.body.phone.fontSize};
        line-height: ${theme.typography.body.phone.lineHeight};
      }

      > .message {
        color: ${theme.colors.textSecondary};
        font-size: ${theme.typography.body.phone.fontSize};
        line-height: ${theme.typography.body.phone.lineHeight};
      }

      > .error {
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
          inline-size: 100%;
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

        &.invalid > input {
          border-color: ${theme.colors.danger};
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

      > .actions {
        display: flex;
        justify-content: flex-end;
        flex-wrap: wrap;
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
