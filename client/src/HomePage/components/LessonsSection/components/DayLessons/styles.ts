import { css } from 'styled-components';

export const DayLessons = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};

  > .heading {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: ${theme.spacing.md};

    > .title {
      font-size: ${theme.typography.sectionHeading.phone.fontSize};
      line-height: ${theme.typography.sectionHeading.phone.lineHeight};
      font-weight: ${theme.typography.sectionHeading.fontWeight};
      color: ${theme.colors.text};

      @media (min-width: ${theme.breakpoints.md}) {
        font-size: ${theme.typography.sectionHeading.desktop.fontSize};
        line-height: ${theme.typography.sectionHeading.desktop.lineHeight};
      }
    }

    > .seeAll {
      flex-shrink: 0;
    }
  }

  > .count {
    color: ${theme.colors.textSecondary};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }

  > .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: ${theme.spacing.lg};

    @media (min-width: ${theme.breakpoints.md}) {
      grid-template-columns: repeat(3, 1fr);
    }

    @media (min-width: ${theme.breakpoints.xl}) {
      grid-template-columns: repeat(4, 1fr);
    }

    /* Grid stretches the <li> to the row's own height by default, but the
       card link inside was only ever as tall as its own content, so two
       cards in the same row could still differ in visible height whenever
       one title wrapped to a second line (design review: "ragged bottom
       edge in the grid"). Making the cell a grid parent too stretches that
       single child to the cell's full inline and block size, so every card
       in a row shares both the row's width and its height. */
    > .cell {
      display: grid;
    }
  }

  > .more {
    align-self: stretch;
    min-block-size: 48px;
    padding-inline: ${theme.spacing.lg};
    border: 1px solid ${theme.colors.primary};
    border-radius: ${theme.radii.md};
    color: ${theme.colors.primary};
    font-weight: ${theme.typography.fontWeight.semiBold};
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};
  }
`,
);
