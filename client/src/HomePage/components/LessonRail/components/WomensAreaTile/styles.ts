import { css } from 'styled-components';

import { CARD_WIDE_THRESHOLD } from '~/HomePage/components/LessonCard/consts';
import { RAIL_CARD_WIDTH_DESKTOP, RAIL_COLUMNS_PHONE } from '~/HomePage/components/LessonRail/consts';
import { railCardWidth, railEdgeOffset } from '~/HomePage/components/LessonRail/helpers';
import { POSTER_ASPECT_RATIO } from '~/HomePage/consts';
import type { Theme } from '~/theme/models';

import { EMBLEM_SIZE_FLOOR, EMBLEM_WIDTH_FACTOR } from './consts';

// The same phone formula the rail's own `<li>` uses to size a card
// (LessonRail/styles.ts, LessonRail/helpers.ts): this is the one place the
// tile's rendered width is computed, so reusing it here for the emblem,
// rather than a CSS percentage that would resolve against `.plum`'s own
// narrower content box, keeps a single source of truth instead of a second
// number that could drift from it. From `md` up the card width is the fixed
// RAIL_CARD_WIDTH_DESKTOP, so no formula is needed there.
const emblemInlineSizePhone = (theme: Theme): string =>
  `max(${EMBLEM_SIZE_FLOOR}px, calc(${EMBLEM_WIDTH_FACTOR} * ${railCardWidth(theme, RAIL_COLUMNS_PHONE, railEdgeOffset(theme, 'gutter'))}))`;

const emblemInlineSizeDesktop = `max(${EMBLEM_SIZE_FLOOR}px, calc(${EMBLEM_WIDTH_FACTOR} * ${RAIL_CARD_WIDTH_DESKTOP}))`;

export const WomensAreaTile = css(
  ({ theme }) => `
  container-type: inline-size;
  display: flex;
  flex-direction: column;
  /* Fills its own \`<li>\` exactly like a card does: the rail's row stretches
     every item to the tallest one (a wrapped meta line, most often), and
     without this the tile would stop at its own natural height instead,
     landing short of its row-mates by however much the row grew. */
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
    container-type: inline-size;
    container-name: plum;
    /* Equal to a lesson card's own poster area, always, never more: fixed
       by the same 3:4 ratio (POSTER_ASPECT_RATIO, HomePage/consts.ts), the
       same pattern the card's own poster now follows. Never distorted:
       the row's stretch lands in \`.white\` below, not here. */
    flex-shrink: 0;
    aspect-ratio: ${POSTER_ASPECT_RATIO};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing.md};
    padding-inline: ${theme.spacing.md};
    background: ${theme.colors.primary};
    text-align: center;

    /* The plum area's own remaining fallbacks, strictly ordered: the gap
       between every item in the column tightens first (159px), then the
       bottom line is dropped (150px, on the line below). The emblem no
       longer needs a fallback of its own: floored at a live percentage
       (below), it already lands at the floor right around the narrowest
       width the rail now ships at. The count itself is never part of
       either. */
    @container plum (max-width: 159px) {
      gap: ${theme.spacing.sm};
    }

    > .emblem {
      flex-shrink: 0;
      /* 44 percent of the CARD's own width (consts.ts, EMBLEM_WIDTH_FACTOR). */
      inline-size: ${emblemInlineSizePhone(theme)};
      /* The height follows the width rather than repeating the same
         calculation: a second, independent height formula could drift
         from the width one, and the ratio already gives a square for free.
         The auto height is what lets the ratio apply at all, since the
         component's own height attribute would otherwise pin it. */
      block-size: auto;
      aspect-ratio: 1;

      @media (min-width: ${theme.breakpoints.md}) {
        /* Fixed, matching LessonRail/styles.ts: the card width no longer
           grows with the viewport from \`md\` up, so the emblem is sized
           against the same constant (RAIL_CARD_WIDTH_DESKTOP). */
        inline-size: ${emblemInlineSizeDesktop};
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
    /* Absorbs the row's own stretch (the plum area above never does, see
       \`.plum\`): the same pattern the card's own body now follows. Never
       below a floor, though: the same tokens a real card's own \`.body\`
       renders with at this width (LessonCard/styles.ts), crossing the
       card's own CARD_WIDE_THRESHOLD (LessonCard/consts.ts, 190px), not
       CANCELLED_LABEL_BOTTOM_THRESHOLD's 200, a different decision. Below
       it: two block paddings, the compact title's line-height, two gaps,
       two more lines at the compact meta line's height. At or above it,
       the same shape with the wide roles instead. This tile's own content
       is always the same two lines regardless of width; the difference
       becomes empty space at the bottom, so the tile matches the card
       beside it exactly when the row does not stretch, and grows with it
       when the row does, same as the card. */
    flex: 1 1 auto;
    min-block-size: calc(
      2 * ${theme.spacing.md} + ${theme.typography.cardTitleCompact.phone.lineHeight} + 2 * ${theme.spacing.xs} + 2 *
        ${theme.typography.secondaryCompact.phone.lineHeight}
    );

    @container (min-inline-size: ${CARD_WIDE_THRESHOLD}) {
      min-block-size: calc(
        2 * ${theme.spacing.md} + ${theme.typography.cardTitle.phone.lineHeight} + 2 * ${theme.spacing.xs} + 2 *
          ${theme.typography.secondary.phone.lineHeight}
      );
    }

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
      font-size: ${theme.typography.cardTitleCompact.phone.fontSize};
      line-height: ${theme.typography.cardTitleCompact.phone.lineHeight};

      @container (min-inline-size: ${CARD_WIDE_THRESHOLD}) {
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

      @container (min-inline-size: ${CARD_WIDE_THRESHOLD}) {
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }

      /* Off scale, matched to TextLink's own chevron viewBox (7x12). */
      > .chevron {
        inline-size: 7px;
        block-size: 12px;
      }
    }
  }
`,
);
