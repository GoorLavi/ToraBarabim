import { css } from 'styled-components';

// Mirrors `DedicationsListPage/styles.ts` (head, card list, skeleton and
// state boxes), with a filter row of chips under the head.
export const MessagesListPage = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};

  > .head {
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
  }

  > .filters {
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing.sm};

    > .chip {
      min-block-size: 48px;
      padding-inline: ${theme.spacing.lg};
      border: 1px solid ${theme.colors.border};
      border-radius: ${theme.radii.pill};
      background: ${theme.colors.surface};
      color: ${theme.colors.text};
      font-weight: ${theme.typography.fontWeight.semiBold};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};

      &.selected {
        border-color: ${theme.colors.primary};
        background: ${theme.colors.primary};
        color: ${theme.colors.textOnPrimary};
      }

      &:focus-visible {
        outline: 2px solid ${theme.colors.primary};
        outline-offset: 2px;
      }
    }
  }

  > .list {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};

    > .skeletonCard {
      block-size: 144px;
      border-radius: ${theme.radii.lg};
      background: ${theme.colors.primarySoft};
      opacity: 0.6;
    }

    > .loadMoreError {
      color: ${theme.colors.danger};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }

    > .loadMore {
      align-self: flex-start;
      min-block-size: 48px;
      padding-inline: ${theme.spacing.lg};
      border: 1px solid ${theme.colors.border};
      border-radius: ${theme.radii.pill};
      background: ${theme.colors.surface};
      color: ${theme.colors.text};
      font-weight: ${theme.typography.fontWeight.semiBold};

      &:disabled {
        opacity: 0.6;
        cursor: progress;
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

    &.error > p {
      color: ${theme.colors.danger};
    }

    &.error > button {
      min-block-size: 48px;
      padding-inline: ${theme.spacing.lg};
      border-radius: ${theme.radii.pill};
      background: ${theme.colors.primary};
      color: ${theme.colors.textOnPrimary};
      font-weight: ${theme.typography.fontWeight.semiBold};
    }

    /* Quiet on purpose: the empty state names what is true, and the way
       out is one calm button rather than a call to action. */
    > .showAll {
      min-block-size: 48px;
      padding-inline: ${theme.spacing.lg};
      border: 1px solid ${theme.colors.border};
      border-radius: ${theme.radii.pill};
      color: ${theme.colors.text};
      font-weight: ${theme.typography.fontWeight.semiBold};
    }
  }
`,
);
