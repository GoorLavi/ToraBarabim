import { css } from 'styled-components';

import { POSTER_ASPECT_RATIO } from '~/HomePage/consts';

import { EMBLEM_SIZE_FLOOR, EMBLEM_SIZE_MD, EMBLEM_SIZE_PHONE, EMBLEM_SIZE_WIDE } from './consts';

export const WomensAreaTile = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
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
    container-type: inline-size;
    container-name: plum;
    /* Equal to a lesson card's own poster area: same ratio, so the same
       width steps to the same height (POSTER_ASPECT_RATIO, HomePage/consts.ts). */
    aspect-ratio: ${POSTER_ASPECT_RATIO};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing.md};
    padding-inline: ${theme.spacing.md};
    background: ${theme.colors.primary};
    text-align: center;

    /* The plum area's own three fallbacks, each only reachable below the
       narrowest width this tile actually ships at (200px), and strictly
       ordered: the emblem shrinks toward its floor first (183px), then the
       gap between every item in the column tightens (159px), then the
       bottom line is dropped (150px, on the line below). The count itself
       is never part of either. */
    @container plum (max-width: 159px) {
      gap: ${theme.spacing.sm};
    }

    > .emblem {
      flex-shrink: 0;
      inline-size: ${EMBLEM_SIZE_PHONE}px;
      block-size: ${EMBLEM_SIZE_PHONE}px;

      @media (min-width: ${theme.breakpoints.md}) {
        inline-size: ${EMBLEM_SIZE_MD}px;
        block-size: ${EMBLEM_SIZE_MD}px;
      }

      @media (min-width: ${theme.breakpoints.lg}) {
        inline-size: ${EMBLEM_SIZE_WIDE}px;
        block-size: ${EMBLEM_SIZE_WIDE}px;
      }

      @container plum (max-width: 183px) {
        inline-size: ${EMBLEM_SIZE_FLOOR}px;
        block-size: ${EMBLEM_SIZE_FLOOR}px;
      }
    }

    > .count {
      flex-shrink: 0;
      color: ${theme.colors.accentOnDark};
      font-weight: ${theme.typography.tileCount.fontWeight};
      font-size: ${theme.typography.tileCount.phone.fontSize};
      line-height: ${theme.typography.tileCount.phone.lineHeight};
    }

    > .countWord {
      flex-shrink: 0;
      color: ${theme.colors.textOnPrimaryMuted};
      font-size: ${theme.typography.secondaryCompact.phone.fontSize};
      line-height: ${theme.typography.secondaryCompact.phone.lineHeight};
    }

    > .line {
      color: ${theme.colors.textOnPrimaryMuted};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
      text-wrap: balance;

      @container plum (max-width: 150px) {
        display: none;
      }
    }
  }

  > .white {
    flex-shrink: 0;
    /* Derived, not mirrored, from the same tokens a lesson card's own
       \`.body\` renders with (LessonCard/styles.ts): two block paddings, the
       title's line-height, two gaps, and two more lines at the meta line's
       height (its own meta line, then its city line). CARD_WIDE_THRESHOLD
       (LessonCard/consts.ts) is 190px, below every width a rail card ships
       at (200/220/240), so a real card's title, meta and city always
       render at these sizes here, never the compact fallback; \`cardTitle\`
       and \`secondary\` are themselves identical at phone and desktop, so
       this is one constant height, not a responsive step. */
    block-size: calc(
      2 * ${theme.spacing.md} + ${theme.typography.cardTitle.phone.lineHeight} + 2 * ${theme.spacing.xs} + 2 *
        ${theme.typography.secondary.phone.lineHeight}
    );
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    /* Content sits at the top: the heading lands on a lesson card's own
       title line and the link on its meta line, with the city line's worth
       of room left below, unused, so the two card types still line up. */
    justify-content: flex-start;
    gap: ${theme.spacing.xs};
    padding: ${theme.spacing.md};

    > .heading {
      color: ${theme.colors.text};
      font-weight: ${theme.typography.cardTitle.fontWeight};
      font-size: ${theme.typography.cardTitle.phone.fontSize};
      line-height: ${theme.typography.cardTitle.phone.lineHeight};
    }

    > .seeAll {
      display: inline-flex;
      align-items: center;
      gap: ${theme.spacing.xs};
      color: ${theme.colors.primary};
      font-weight: ${theme.typography.fontWeight.semiBold};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};

      /* Off scale, matched to TextLink's own chevron viewBox (7x12). */
      > .chevron {
        inline-size: 7px;
        block-size: 12px;
      }
    }
  }
`,
);
