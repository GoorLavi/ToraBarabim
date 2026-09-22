import { css } from 'styled-components';

import { POSTER_ASPECT_RATIO } from '~/HomePage/consts';

import { RAIL_CARD_WIDTH_DESKTOP, RAIL_COLUMNS_PHONE } from './consts';
import { railCardWidth, railEdgeOffset } from './helpers';

export const LessonRail = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;

  > .heading {
    font-size: ${theme.typography.sectionHeading.phone.fontSize};
    line-height: ${theme.typography.sectionHeading.phone.lineHeight};
    font-weight: ${theme.typography.sectionHeading.fontWeight};
    color: ${theme.colors.text};
    text-align: start;

    @media (min-width: ${theme.breakpoints.md}) {
      font-size: ${theme.typography.sectionHeading.desktop.fontSize};
      line-height: ${theme.typography.sectionHeading.desktop.lineHeight};
    }
  }

  > .scrollerWrap {
    position: relative;
    margin-block-start: ${theme.spacing.lg};
    /* Cancels the rail's own edge offset exactly, so the scroller reaches
       the same edge the band itself reaches at every width, not just up to
       its cap (helpers.ts, railEdgeOffset). */
    margin-inline: calc(-1 * ${railEdgeOffset(theme, 'gutter')});

    @media (min-width: ${theme.breakpoints.md}) {
      margin-inline: calc(-1 * ${railEdgeOffset(theme, 'full')});
    }

    > .arrow {
      display: none;

      @media (min-width: ${theme.breakpoints.md}) {
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        z-index: 1;
        /* Centred on the poster, not the whole card: half the poster's own
           height (the fixed desktop card width divided by
           POSTER_ASPECT_RATIO, the same formula LessonCard's own poster
           uses) minus half the button's own 48px, so the button's centre
           lands on the poster's centre rather than its own top edge. The
           card width is constant from \`md\` up (RAIL_CARD_WIDTH_DESKTOP),
           so this is a single value rather than a value per breakpoint. */
        inset-block-start: calc(${RAIL_CARD_WIDTH_DESKTOP} / ${POSTER_ASPECT_RATIO} / 2 - 24px);
        inline-size: 48px;
        block-size: 48px;
        border: 1px solid ${theme.colors.border};
        border-radius: ${theme.radii.pill};
        background: ${theme.colors.surface};
        color: ${theme.colors.primary};
        box-shadow: ${theme.shadows.card};

        &:disabled {
          opacity: 0.4;
        }

        > svg {
          inline-size: 20px;
          block-size: 20px;
        }
      }

      &.prev {
        inset-inline-start: ${theme.spacing.sm};
      }

      &.next {
        inset-inline-end: ${theme.spacing.sm};
      }
    }

    > .scrollerGroup {
      overflow-x: auto;
      /* Explicit, not left to default: setting only \`overflow-x\` computes
         \`overflow-y\` to \`auto\` too (CSS Overflow), which on a block-size:
         auto container reserves room for the horizontal scrollbar by
         growing the box itself, not by borrowing from the content area,
         which was the extra space above WomensAreaBand (design review).
         \`hidden\` opts out of that growth; the card's keyboard focus ring
         (outline 2px, offset 2px) still needs room, which \`padding-block\`
         below reserves instead. */
      overflow-y: hidden;
      overscroll-behavior-inline: contain;
      scroll-snap-type: inline proximity;
      padding-inline: ${railEdgeOffset(theme, 'gutter')};
      padding-block: ${theme.spacing.xs};
      scroll-padding-inline-start: ${railEdgeOffset(theme, 'gutter')};
      scrollbar-width: none;

      @media (min-width: ${theme.breakpoints.md}) {
        padding-inline: ${railEdgeOffset(theme, 'full')};
        scroll-padding-inline-start: ${railEdgeOffset(theme, 'full')};
      }

      &::-webkit-scrollbar {
        display: none;
      }

      > .scroller {
        display: flex;
        /* \`sm\` at every width (owner, 2026-09-22: fixed at 8). Below \`md\`
           this is deliberately narrower than railCardWidth's own sizing
           math (which always bakes in \`lg\`, helpers.ts), so the difference
           surfaces as peek. From \`md\` up the card is a fixed width
           (RAIL_CARD_WIDTH_DESKTOP) rather than a viewport-derived formula,
           so peek there is a property of the row's own fixed-width
           arithmetic rather than of this gap; \`sm\` still holds as the
           floor two adjacent cards must keep as real tap-target
           separation (design-system.md, "8 is the floor"). */
        gap: ${theme.spacing.sm};

        > li {
          /* The grid's own phone column width (components/LessonsGrid/
             styles.ts), computed rather than retyped (helpers.ts,
             railCardWidth), so the two cannot drift. */
          flex: 0 0 ${railCardWidth(theme, RAIL_COLUMNS_PHONE, railEdgeOffset(theme, 'gutter'))};
          scroll-snap-align: start;

          @media (min-width: ${theme.breakpoints.md}) {
            /* Fixed, not a column-count formula: the card never grows past
               this ceiling from \`md\` up, and however many fit the viewport
               is how many show (consts.ts, RAIL_CARD_WIDTH_DESKTOP). */
            flex-basis: ${RAIL_CARD_WIDTH_DESKTOP};
          }
        }
      }
    }
  }
`,
);
