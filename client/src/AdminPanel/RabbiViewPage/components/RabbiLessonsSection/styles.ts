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
      text-decoration: none;
    }
  }

  > .skeletonList {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};

    > .skeletonRow {
      block-size: 66px;
      border-radius: ${theme.radii.md};
      background: ${theme.colors.primarySoft};
      opacity: 0.6;
    }
  }

  > .list {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};

    /* The hairline moves off the row and into the gap between rows, so the
       8px gap stays real separation between two adjacent tap targets
       (design-system.md, "Row list has zero separation between adjacent tap
       targets"), rather than sitting beside one of them. Positioned on the
       item, not the row, for the same reason :not(:first-child) used to
       target the row directly: a row is always its item's only child. */
    > .item {
      position: relative;

      &:not(:first-child)::before {
        content: '';
        position: absolute;
        inset-inline: 0;
        inset-block-start: calc(${theme.spacing.sm} / -2);
        block-size: 1px;
        background: ${theme.colors.border};
      }
    }

    > .item > .row {
      display: flex;
      align-items: center;
      gap: ${theme.spacing.sm};
      min-block-size: 66px;
      padding-block: ${theme.spacing.sm};
      color: ${theme.colors.text};
      text-decoration: none;

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
    text-decoration: none;

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        text-decoration: underline;
      }
    }

    &:focus-visible {
      text-decoration: underline;
    }
  }
`,
);
