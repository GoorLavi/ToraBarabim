import { css } from 'styled-components';

export const OccurrenceRow = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  background: ${theme.colors.surface};

  > .top {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};

    > .dateTime {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: ${theme.spacing.sm};

      > .date {
        color: ${theme.colors.text};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.body.phone.fontSize};
        line-height: ${theme.typography.body.phone.lineHeight};
      }

      > .time {
        color: ${theme.colors.accent};
        font-weight: ${theme.typography.timeInCard.fontWeight};
        font-size: ${theme.typography.timeInCard.phone.fontSize};
        line-height: ${theme.typography.timeInCard.phone.lineHeight};

        &.struck {
          color: ${theme.colors.textSecondary};
          text-decoration: line-through;
        }
      }
    }

    > .address {
      overflow-wrap: break-word;
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }

    > .tags {
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

    > .reason {
      overflow-wrap: break-word;
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }
  }

  &.cancelled > .top > .dateTime > .date {
    color: ${theme.colors.textSecondary};
  }

  > .actions {
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing.sm};

    > .action {
      flex: 1 1 auto;
      min-inline-size: 120px;
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

  > .unavailable {
    color: ${theme.colors.danger};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }
`,
);
