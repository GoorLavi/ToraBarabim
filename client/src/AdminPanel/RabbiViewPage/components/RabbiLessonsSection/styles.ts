import { css } from 'styled-components';

// Card padding `md` rather than `lg`, per design-system.md's "the admin
// panel is denser than the public site".
export const RabbiLessonsSection = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.surface};
  box-shadow: ${theme.shadows.card};

  > .heading {
    color: ${theme.colors.text};
    font-weight: ${theme.typography.sectionHeading.fontWeight};
    font-size: ${theme.typography.sectionHeading.phone.fontSize};
    line-height: ${theme.typography.sectionHeading.phone.lineHeight};
  }

  > .state {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: ${theme.spacing.sm};
    color: ${theme.colors.textSecondary};
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};

    &.error > .message {
      color: ${theme.colors.danger};
    }

    > .headline {
      color: ${theme.colors.text};
      font-weight: ${theme.typography.fontWeight.semiBold};
    }

    > .retry,
    > .cta {
      min-block-size: 48px;
      padding-inline: ${theme.spacing.lg};
      border-radius: ${theme.radii.pill};
      background: ${theme.colors.primary};
      color: ${theme.colors.textOnPrimary};
      font-weight: ${theme.typography.fontWeight.semiBold};
      display: flex;
      align-items: center;
    }
  }

  > .skeletonList {
    display: flex;
    flex-direction: column;

    > .skeletonRow {
      min-block-size: 66px;
      padding-block: ${theme.spacing.sm};
      border-radius: ${theme.radii.md};
      background: ${theme.colors.border};
      opacity: 0.5;

      &:not(:first-child) {
        margin-block-start: ${theme.spacing.sm};
      }
    }
  }

  > .list {
    display: flex;
    flex-direction: column;

    > li > .row {
      display: flex;
      align-items: center;
      gap: ${theme.spacing.sm};
      min-block-size: 66px;
      padding-block: ${theme.spacing.sm};
      color: ${theme.colors.text};

      &:not(:first-child) {
        border-block-start: 1px solid ${theme.colors.border};
      }

      > .text {
        flex: 1;
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        gap: ${theme.spacing.xs};

        > .primary {
          font-weight: ${theme.typography.fontWeight.semiBold};
          font-size: ${theme.typography.body.phone.fontSize};
          line-height: ${theme.typography.body.phone.lineHeight};
          overflow-wrap: break-word;
        }

        > .meta {
          color: ${theme.colors.textSecondary};
          font-size: ${theme.typography.secondary.phone.fontSize};
          line-height: ${theme.typography.secondary.phone.lineHeight};
          overflow-wrap: break-word;
        }
      }

      > .chevron {
        flex-shrink: 0;
        inline-size: 20px;
        block-size: 20px;
        color: ${theme.colors.textSecondary};
      }
    }
  }

  > .seeAll {
    align-self: flex-start;
    display: flex;
    align-items: center;
    min-block-size: 48px;
    color: ${theme.colors.primary};
    font-weight: ${theme.typography.fontWeight.semiBold};
  }
`,
);
