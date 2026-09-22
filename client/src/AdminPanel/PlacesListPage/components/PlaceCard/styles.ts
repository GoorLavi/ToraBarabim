import { css } from 'styled-components';

export const PlaceCard = css(
  ({ theme }) => `
  display: flex;
  align-items: flex-start;
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.surface};
  box-shadow: ${theme.shadows.card};

  &.inactive {
    background: ${theme.colors.bg};
  }

  > .body {
    flex: 1;
    min-inline-size: 0;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};

    > .name {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: ${theme.spacing.sm};
      color: ${theme.colors.text};
      font-weight: ${theme.typography.cardTitle.fontWeight};
      font-size: ${theme.typography.cardTitle.phone.fontSize};
      line-height: ${theme.typography.cardTitle.phone.lineHeight};
      overflow-wrap: break-word;

      > .inactiveTag {
        padding-inline: ${theme.spacing.sm};
        border-radius: ${theme.radii.pill};
        background: ${theme.colors.primarySoft};
        color: ${theme.colors.textSecondary};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.tagAndCaption.phone.fontSize};
        line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
      }
    }

    > .address {
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }

    > .actions {
      display: flex;
      flex-wrap: wrap;
      gap: ${theme.spacing.sm};
      margin-block-start: ${theme.spacing.xs};

      > .edit {
        display: flex;
        align-items: center;
        min-block-size: 48px;
        padding-inline: ${theme.spacing.md};
        border: 1px solid ${theme.colors.border};
        border-radius: ${theme.radii.pill};
        color: ${theme.colors.text};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
        text-decoration: none;
      }
    }
  }
`,
);
