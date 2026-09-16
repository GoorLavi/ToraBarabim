import { css } from 'styled-components';

import { EMBLEM_SIZE_PHONE, EMBLEM_SIZE_WIDE } from './consts';

export const WomensAreaTile = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  /* Stretches to the list item's own height, set by the tallest lesson
     card in the row, rather than a fixed height of its own. */
  block-size: 100%;
  overflow: hidden;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.surface};
  box-shadow: ${theme.shadows.card};
  color: inherit;
  text-decoration: none;

  &:focus-visible {
    outline: 2px solid ${theme.colors.primary};
    outline-offset: 2px;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      border-color: ${theme.colors.primary};
    }
  }

  > .plum {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${theme.spacing.xs};
    padding: ${theme.spacing.lg};
    background: ${theme.colors.primary};
    text-align: center;

    > .emblem {
      inline-size: ${EMBLEM_SIZE_PHONE}px;
      block-size: ${EMBLEM_SIZE_PHONE}px;

      /* Steps at the same viewport breakpoint LessonRail/styles.ts steps
         the card width at, not a container query. */
      @media (min-width: ${theme.breakpoints.lg}) {
        inline-size: ${EMBLEM_SIZE_WIDE}px;
        block-size: ${EMBLEM_SIZE_WIDE}px;
      }
    }

    > .count {
      color: ${theme.colors.accentOnDark};
      font-weight: ${theme.typography.fontWeight.bold};
      font-size: ${theme.typography.ticketDate.phone.fontSize};
      line-height: ${theme.typography.ticketDate.phone.lineHeight};
    }

    > .countWord {
      color: ${theme.colors.textOnPrimary};
      font-weight: ${theme.typography.fontWeight.semiBold};
      font-size: ${theme.typography.cardTitle.phone.fontSize};
      line-height: ${theme.typography.cardTitle.phone.lineHeight};
    }

    > .line {
      color: ${theme.colors.textOnPrimaryMuted};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
      text-wrap: balance;
    }
  }

  > .white {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    /* Content sits at the top, any leftover height (the tile stretches to
       match the lesson card beside it) collects below instead of pushing
       the link down toward the middle. */
    justify-content: flex-start;
    gap: ${theme.spacing.xs};
    padding: ${theme.spacing.md};

    > .heading {
      color: ${theme.colors.text};
      font-weight: ${theme.typography.cardTitle.fontWeight};
      font-size: ${theme.typography.cardTitleCompact.phone.fontSize};
      line-height: ${theme.typography.cardTitleCompact.phone.lineHeight};

      @media (min-width: ${theme.breakpoints.lg}) {
        font-size: ${theme.typography.cardTitle.phone.fontSize};
        line-height: ${theme.typography.cardTitle.phone.lineHeight};
      }
    }

    > .seeAll {
      display: inline-flex;
      align-items: center;
      gap: ${theme.spacing.xs};
      color: ${theme.colors.primary};
      font-weight: ${theme.typography.fontWeight.semiBold};
      font-size: ${theme.typography.secondaryCompact.phone.fontSize};
      line-height: ${theme.typography.secondaryCompact.phone.lineHeight};

      /* Off scale, matched to TextLink's own chevron viewBox (7x12). */
      > .chevron {
        inline-size: 7px;
        block-size: 12px;
      }
    }
  }
`,
);
