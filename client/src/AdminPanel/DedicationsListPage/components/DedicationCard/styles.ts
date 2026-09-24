import { css } from 'styled-components';

export const DedicationCard = css(
  ({ theme }) => `
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.surface};
  box-shadow: ${theme.shadows.card};

  > .body {
    flex: 1;
    min-inline-size: 220px;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};

    > .head {
      display: flex;
      align-items: center;
      gap: ${theme.spacing.sm};

      > .type {
        color: ${theme.colors.textSecondary};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }
    }

    > .name {
      color: ${theme.colors.text};
      font-weight: ${theme.typography.cardTitle.fontWeight};
      font-size: ${theme.typography.cardTitle.phone.fontSize};
      line-height: ${theme.typography.cardTitle.phone.lineHeight};
      overflow-wrap: break-word;
    }

    > .window {
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }
  }

  > .edit {
    flex: 0 0 auto;
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
`,
);
