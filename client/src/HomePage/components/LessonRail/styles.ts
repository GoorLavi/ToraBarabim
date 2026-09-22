import { css } from 'styled-components';

import { EDGE_FADE_WIDTH_PHONE, POSTER_ASPECT_RATIO } from '~/HomePage/consts';

import { RAIL_COLUMNS_MD, RAIL_COLUMNS_PHONE, RAIL_COLUMNS_XL } from './consts';
import { railCardWidth, railEdgeOffset } from './helpers';

export const LessonRail = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};

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
    /* Cancels the content band's own edge offset exactly, so the scroller
       reaches the same edge the band itself reaches at every width, not
       just up to its cap (helpers.ts, railEdgeOffset). */
    margin-inline: calc(-1 * ${railEdgeOffset(theme, false)});

    @media (min-width: ${theme.breakpoints.md}) {
      margin-inline: calc(-1 * ${railEdgeOffset(theme, true)});
    }

    > .arrow {
      display: none;

      @media (min-width: ${theme.breakpoints.lg}) {
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        z-index: 1;
        /* Centred on the poster, not the whole card: half the poster's own
           height (the card's own width divided by POSTER_ASPECT_RATIO,
           the same formula LessonCard's own poster uses) minus half the
           button's own 48px, so the button's centre lands on the poster's
           centre rather than its own top edge. Live, not the single 1280
           figure Figma draws: below \`xl\` there are still only 3 columns
           (RAIL_COLUMNS_MD), so the card, and the poster, are wider there
           than at \`xl\` and up (RAIL_COLUMNS_XL), where a 4th column lands. */
        inset-block-start: calc(
          ${railCardWidth(theme, RAIL_COLUMNS_MD, railEdgeOffset(theme, true))} / ${POSTER_ASPECT_RATIO} / 2 - 24px
        );
        inline-size: 48px;
        block-size: 48px;
        border: 1px solid ${theme.colors.border};
        border-radius: ${theme.radii.pill};
        background: ${theme.colors.surface};
        color: ${theme.colors.primary};
        box-shadow: ${theme.shadows.card};

        @media (min-width: ${theme.breakpoints.xl}) {
          inset-block-start: calc(
            ${railCardWidth(theme, RAIL_COLUMNS_XL, railEdgeOffset(theme, true))} / ${POSTER_ASPECT_RATIO} / 2 - 24px
          );
        }

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

    > .fade {
      display: none;
      position: absolute;
      z-index: 1;
      inset-block: 0;
      /* The row's end, the direction cards keep coming from as it scrolls:
         positioning stays logical (inset-inline-end). */
      inset-inline-end: 0;
      inline-size: ${EDGE_FADE_WIDTH_PHONE};
      /* The gradient's own axis stays physical (\`to left\`, not an
         inline-end keyword): CSS cannot express a gradient direction in
         logical terms, and the page is permanently RTL, never bilingual,
         so "left" here can never end up wrong. */
      background: linear-gradient(
        to left,
        ${theme.colors.bg} 0%,
        color-mix(in srgb, ${theme.colors.bg} 60%, transparent) 50%,
        transparent 100%
      );
      pointer-events: none;

      @media (min-width: ${theme.breakpoints.md}) {
        inline-size: ${theme.spacing.xxl};
      }

      &.visible {
        display: block;
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
      padding-inline: ${railEdgeOffset(theme, false)};
      padding-block: ${theme.spacing.xs};
      scroll-padding-inline-start: ${railEdgeOffset(theme, false)};
      scrollbar-width: none;

      @media (min-width: ${theme.breakpoints.md}) {
        padding-inline: ${railEdgeOffset(theme, true)};
        scroll-padding-inline-start: ${railEdgeOffset(theme, true)};
      }

      &::-webkit-scrollbar {
        display: none;
      }

      @media (pointer: fine) {
        scrollbar-width: thin;

        &::-webkit-scrollbar {
          display: block;
          block-size: 6px;
        }

        &::-webkit-scrollbar-thumb {
          background: ${theme.colors.border};
          border-radius: ${theme.radii.pill};
        }
      }

      > .scroller {
        display: flex;
        gap: ${theme.spacing.lg};

        > li {
          /* The grid's own column width at each of its breakpoints
             (components/LessonsGrid/styles.ts), computed rather than
             retyped (helpers.ts, railCardWidth), so the two cannot drift. */
          flex: 0 0 ${railCardWidth(theme, RAIL_COLUMNS_PHONE, railEdgeOffset(theme, false))};
          scroll-snap-align: start;

          @media (min-width: ${theme.breakpoints.md}) {
            flex-basis: ${railCardWidth(theme, RAIL_COLUMNS_MD, railEdgeOffset(theme, true))};
          }

          @media (min-width: ${theme.breakpoints.xl}) {
            flex-basis: ${railCardWidth(theme, RAIL_COLUMNS_XL, railEdgeOffset(theme, true))};
          }
        }
      }
    }
  }
`,
);
