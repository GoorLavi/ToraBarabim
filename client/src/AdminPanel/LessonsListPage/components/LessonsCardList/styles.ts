import { css } from 'styled-components';

export const LessonsCardList = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};

  @media (min-width: ${theme.breakpoints.md}) {
    display: none;
  }

  > .card {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
    padding: ${theme.spacing.md};
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radii.lg};
    background: ${theme.colors.surface};

    > .lesson {
      display: flex;
      flex-direction: column;

      > .primary {
        color: ${theme.colors.text};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.cardTitle.phone.fontSize};
        line-height: ${theme.typography.cardTitle.phone.lineHeight};
      }

      > .secondary {
        color: ${theme.colors.textSecondary};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }
    }

    > .meta {
      display: flex;
      gap: ${theme.spacing.sm};
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
        background: ${theme.colors.primarySoft};
        color: ${theme.colors.text};
        font-size: ${theme.typography.tagAndCaption.phone.fontSize};
        line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
      }
    }

    > .edit {
      align-self: flex-start;
      min-block-size: 48px;
      display: flex;
      align-items: center;
      color: ${theme.colors.primary};
      font-weight: ${theme.typography.fontWeight.semiBold};
    }
  }
`,
);
