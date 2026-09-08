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
    justify-content: space-between;
  }

  > .body {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};

    @media (min-width: ${theme.breakpoints.md}) {
      flex: 1;
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

      &:disabled {
        opacity: 0.6;
      }
    }

    > .selfNote {
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
`,
);
