import { css } from 'styled-components';

// Label-value rows (design brief A, item 12): a fixed 56px label column at
// the inline start, the value filling the rest, rows separated by a
// hairline between them rather than a border around the whole list.
export const CourseFacts = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;

  > .fact {
    display: flex;
    align-items: flex-start;
    gap: ${theme.spacing.sm};
    padding-block: ${theme.spacing.md};

    &:not(:first-child) {
      border-block-start: 1px solid ${theme.colors.border};
    }

    > .label {
      flex: 0 0 56px;
      color: ${theme.colors.textSecondary};
      font-weight: ${theme.typography.fontWeight.semiBold};
      font-size: ${theme.typography.tagAndCaption.phone.fontSize};
      line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
    }

    > .value {
      min-inline-size: 0;
      flex: 1 1 auto;
      color: ${theme.colors.text};
      font-weight: ${theme.typography.fontWeight.semiBold};
      font-size: ${theme.typography.body.phone.fontSize};
      line-height: ${theme.typography.body.phone.lineHeight};
    }

    > .valueGroup {
      min-inline-size: 0;
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.xs};

      > .value {
        color: ${theme.colors.text};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.body.phone.fontSize};
        line-height: ${theme.typography.body.phone.lineHeight};

        /* Never wraps: a full address wrapping mid-line is a design-system
           trap of its own (design-system.md, "A number at a line break
           flips"), and this row already keeps street and city apart. */
        &.street {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        > .venueLink {
          color: ${theme.colors.primary};
          text-decoration: underline;
        }
      }

      > .navLinks {
        display: flex;
        flex-wrap: wrap;
        gap: ${theme.spacing.sm};
        margin-block-start: ${theme.spacing.xs};

        /* The side card's own copy of this component is a fixed 360px
           column (CoursePage/styles.ts): too narrow for both full-word
           buttons to share a line under just the value column's own share
           of it, so from here the row is pulled back to start under the
           label column instead, the card's whole inner width. */
        @media (min-width: ${theme.breakpoints.lg}) {
          flex-wrap: nowrap;
          margin-inline-start: calc(-1 * (56px + ${theme.spacing.sm}));
        }

        > .navButton {
          flex: 1 1 160px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: ${theme.spacing.xs};
          min-block-size: 48px;
          padding-inline: ${theme.spacing.md};
          border: 1px solid ${theme.colors.border};
          border-radius: ${theme.radii.pill};
          color: ${theme.colors.primary};
          font-weight: ${theme.typography.fontWeight.semiBold};
          text-decoration: none;
          white-space: nowrap;
        }
      }
    }
  }
`,
);
