import { css } from 'styled-components';

export const OccurrenceCard = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.lg};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.surface};
  box-shadow: ${theme.shadows.card};

  > .top {
    display: flex;
    gap: ${theme.spacing.md};
    align-items: flex-start;

    > .time {
      flex: 0 0 auto;
      padding-block-start: 2px;
      color: ${theme.colors.accent};
      font-weight: ${theme.typography.timeInCard.fontWeight};
      font-size: ${theme.typography.timeInCard.phone.fontSize};
      line-height: ${theme.typography.timeInCard.phone.lineHeight};

      &.struck {
        color: ${theme.colors.textSecondary};
        text-decoration: line-through;
      }
    }

    > .info {
      flex: 1;
      min-inline-size: 0;

      > .title {
        color: ${theme.colors.text};
        font-weight: ${theme.typography.cardTitle.fontWeight};
        font-size: ${theme.typography.cardTitle.phone.fontSize};
        line-height: ${theme.typography.cardTitle.phone.lineHeight};
      }

      > .where {
        margin-block-start: 2px;
        color: ${theme.colors.textSecondary};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }

      > .tags {
        margin-block-start: ${theme.spacing.sm};
        display: flex;
        flex-wrap: wrap;
        gap: ${theme.spacing.xs};

        > .tag {
          padding-block: 2px;
          padding-inline: ${theme.spacing.sm};
          border-radius: ${theme.radii.sm};
          font-weight: ${theme.typography.fontWeight.semiBold};
          font-size: ${theme.typography.tagAndCaption.phone.fontSize};
          line-height: ${theme.typography.tagAndCaption.phone.lineHeight};

          &.cancelled {
            background: ${theme.colors.bg};
            color: ${theme.colors.textSecondary};
          }

          &.moved {
            background: ${theme.colors.accentSoft};
            color: ${theme.colors.text};
          }
        }
      }
    }
  }

  &.cancelled > .top > .info > .title {
    color: ${theme.colors.textSecondary};
  }

  > .actions {
    display: flex;
    gap: ${theme.spacing.sm};

    > .action {
      flex: 1;
      min-block-size: 48px;
      padding-inline: ${theme.spacing.md};
      border: 1px solid ${theme.colors.border};
      border-radius: ${theme.radii.md};
      background: ${theme.colors.surface};
      color: ${theme.colors.primary};
      font-weight: ${theme.typography.fontWeight.semiBold};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};

      &:disabled {
        opacity: 0.6;
      }
    }
  }
`,
);
