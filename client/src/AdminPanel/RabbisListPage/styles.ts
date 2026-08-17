import { css } from 'styled-components';

export const RabbisListPage = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};

  > .head {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: ${theme.spacing.md};

    > .heading {
      > .title {
        color: ${theme.colors.text};
        font-weight: ${theme.typography.pageHeading.fontWeight};
        font-size: ${theme.typography.pageHeading.phone.fontSize};
        line-height: ${theme.typography.pageHeading.phone.lineHeight};

        @media (min-width: ${theme.breakpoints.md}) {
          font-size: ${theme.typography.pageHeading.desktop.fontSize};
          line-height: ${theme.typography.pageHeading.desktop.lineHeight};
        }
      }

      > .subheading {
        margin-block-start: ${theme.spacing.xs};
        color: ${theme.colors.textSecondary};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }
    }

    > .add {
      display: flex;
      align-items: center;
      min-block-size: 48px;
      padding-inline: ${theme.spacing.lg};
      border-radius: ${theme.radii.pill};
      background: ${theme.colors.primary};
      color: ${theme.colors.textOnPrimary};
      font-weight: ${theme.typography.fontWeight.semiBold};
    }
  }

  > .filters {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${theme.spacing.md};

    > .sort {
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }

    > .search {
      flex: 1;
      min-inline-size: 220px;
      min-block-size: 48px;
      padding-inline: ${theme.spacing.md};
      border: 1px solid ${theme.colors.border};
      border-radius: ${theme.radii.md};
      background: ${theme.colors.surface};
      color: ${theme.colors.text};
      font-size: ${theme.typography.body.phone.fontSize};
      line-height: ${theme.typography.body.phone.lineHeight};
    }
  }

  > .list {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};

    > .skeletonCard {
      display: flex;
      align-items: stretch;
      gap: ${theme.spacing.md};
      padding: ${theme.spacing.md};
      border: 1px solid ${theme.colors.border};
      border-radius: ${theme.radii.lg};
      background: ${theme.colors.surface};

      > .thumb {
        flex: 0 0 auto;
        inline-size: 72px;
        aspect-ratio: 2 / 3;
        border-radius: ${theme.radii.sm};
        background: ${theme.colors.primarySoft};
        opacity: 0.6;
      }

      > .lines {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: ${theme.spacing.xs};

        > .line {
          block-size: 14px;
          border-radius: ${theme.radii.sm};
          background: ${theme.colors.primarySoft};
          opacity: 0.6;

          &.short {
            max-inline-size: 96px;
          }
        }
      }
    }
  }

  > .state {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.xl};
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radii.lg};
    background: ${theme.colors.surface};

    > .headline {
      color: ${theme.colors.text};
      font-weight: ${theme.typography.fontWeight.semiBold};
      font-size: ${theme.typography.body.phone.fontSize};
      line-height: ${theme.typography.body.phone.lineHeight};
    }

    > .hint {
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }

    &.error > p {
      color: ${theme.colors.danger};
    }

    > button,
    > .cta {
      min-block-size: 48px;
      padding-inline: ${theme.spacing.lg};
      border-radius: ${theme.radii.pill};
      background: ${theme.colors.primary};
      color: ${theme.colors.textOnPrimary};
      font-weight: ${theme.typography.fontWeight.semiBold};
    }
  }
`,
);
