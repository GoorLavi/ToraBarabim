import { css } from 'styled-components';

export const CoursesCardList = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};

  @media (min-width: ${theme.breakpoints.md}) {
    display: none;
  }

  > .card {
    display: flex;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.md};
    border: 1px solid ${theme.colors.border};
    border-radius: ${theme.radii.lg};
    background: ${theme.colors.surface};

    > .thumbnail {
      flex: 0 0 64px;
      inline-size: 64px;
      aspect-ratio: 3 / 4;
      border-radius: ${theme.radii.md};
      object-fit: cover;
    }

    > .body {
      min-inline-size: 0;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.xs};

      > .title {
        color: ${theme.colors.text};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.cardTitle.phone.fontSize};
        line-height: ${theme.typography.cardTitle.phone.lineHeight};

        > .cycle {
          color: ${theme.colors.textSecondary};
          font-weight: ${theme.typography.fontWeight.regular};
        }
      }

      > .secondary,
      > .meta {
        color: ${theme.colors.textSecondary};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }

      > .tags {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: ${theme.spacing.xs};
      }

      /* Never wraps onto two lines (design gate finding): the tag stays
         beside its own line, which wraps its own text instead if the two
         together do not fit the card's width. */
      > .closedRow {
        display: flex;
        flex-wrap: nowrap;
        align-items: baseline;
        gap: ${theme.spacing.xs};
      }

      > .tags > .tag,
      > .closedRow > .tag {
        padding-block: 2px;
        padding-inline: ${theme.spacing.sm};
        border-radius: ${theme.radii.sm};
        background: ${theme.colors.primarySoft};
        color: ${theme.colors.text};
        font-size: ${theme.typography.tagAndCaption.phone.fontSize};
        line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
      }

      /* A closed or full status is a terminal state (design gate finding),
         filled solid rather than the soft tint an open status and every
         other tag keep. */
      > .closedRow > .tag {
        flex: 0 0 auto;
        background: ${theme.colors.primary};
        color: ${theme.colors.textOnPrimary};
      }

      > .closedRow > .closedLine {
        flex: 1 1 auto;
        min-inline-size: 0;
        color: ${theme.colors.textSecondary};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }

      > .details {
        align-self: flex-start;
        min-block-size: 48px;
        display: flex;
        align-items: center;
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
    }
  }
`,
);
