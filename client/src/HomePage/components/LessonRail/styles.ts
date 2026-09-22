import { css } from 'styled-components';

import { POSTER_ASPECT_RATIO } from '~/HomePage/consts';

import { RAIL_COLUMNS_MD, RAIL_COLUMNS_PHONE, RAIL_COLUMNS_WIDE, RAIL_COLUMNS_XL, RAIL_FOUR_COL_BREAKPOINT } from './consts';
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
       its cap (helpers.ts, railEdgeOffset). From \`md\` to RAIL_FOUR_COL_
       BREAKPOINT the band is held at RAIL_HELD_BAND_WIDTH ('held'), which
       caps the 3-column card at 276px. From RAIL_FOUR_COL_BREAKPOINT up,
       this uses 'full' rather than 'held': below \`xl\` that expression is
       a flat \`theme.spacing.xl\`, identical to the page's own unheld
       gutter, so the 4-column card grows continuously into the real
       \`>= xl\` case with no jump at 1280. RAIL_HELD_BAND_WIDTH and
       RAIL_FOUR_COL_BREAKPOINT are chosen together so both sides of that
       seam compute to the same 276px (consts.ts); using 'held' on this side
       of the seam instead would neither match that 276px nor grow into the
       real \`>= xl\` case, reintroducing the same kind of size
       discontinuity this whole fix exists to remove. */
    margin-inline: calc(-1 * ${railEdgeOffset(theme, 'gutter')});

    @media (min-width: ${theme.breakpoints.md}) {
      margin-inline: calc(-1 * ${railEdgeOffset(theme, 'held')});
    }

    @media (min-width: ${RAIL_FOUR_COL_BREAKPOINT}) {
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
           height (the card's own width divided by POSTER_ASPECT_RATIO,
           the same formula LessonCard's own poster uses) minus half the
           button's own 48px, so the button's centre lands on the poster's
           centre rather than its own top edge. Live, not the single 1280
           figure Figma draws: from \`md\` to RAIL_FOUR_COL_BREAKPOINT there
           are 3 held columns (RAIL_COLUMNS_MD, 'held'); from there up there
           are 4 columns on the 'full' offset (RAIL_COLUMNS_WIDE), which
           carries continuously through and past \`xl\` with no separate
           branch needed there. */
        inset-block-start: calc(
          ${railCardWidth(theme, RAIL_COLUMNS_MD, railEdgeOffset(theme, 'held'))} / ${POSTER_ASPECT_RATIO} / 2 - 24px
        );
        inline-size: 48px;
        block-size: 48px;
        border: 1px solid ${theme.colors.border};
        border-radius: ${theme.radii.pill};
        background: ${theme.colors.surface};
        color: ${theme.colors.primary};
        box-shadow: ${theme.shadows.card};

        @media (min-width: ${RAIL_FOUR_COL_BREAKPOINT}) {
          /* No third branch at \`xl\`: 'full' is one continuous expression
             through and past \`xl\`, so this already carries the arrow
             correctly into the real >= xl case without a separate value. */
          inset-block-start: calc(
            ${railCardWidth(theme, RAIL_COLUMNS_WIDE, railEdgeOffset(theme, 'full'))} / ${POSTER_ASPECT_RATIO} / 2 - 24px
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
        padding-inline: ${railEdgeOffset(theme, 'held')};
        scroll-padding-inline-start: ${railEdgeOffset(theme, 'held')};
      }

      @media (min-width: ${RAIL_FOUR_COL_BREAKPOINT}) {
        /* 'full' below \`xl\` is a flat \`theme.spacing.xl\`, so this carries
           straight through into the real >= xl case with no jump at 1280
           (see the matching comment on .scrollerWrap's margin-inline). */
        padding-inline: ${railEdgeOffset(theme, 'full')};
        scroll-padding-inline-start: ${railEdgeOffset(theme, 'full')};
      }

      &::-webkit-scrollbar {
        display: none;
      }

      > .scroller {
        display: flex;
        /* \`sm\` at every width, deliberately below railCardWidth's own
           sizing math (which always bakes in \`lg\`, helpers.ts), so the
           difference surfaces as peek at every width, not only on a phone
           (design-system.md, "Horizontal rails"). This replaced an earlier
           \`sm\` below \`md\` / \`lg\` from \`md\` up split: from \`md\` to
           RAIL_FOUR_COL_BREAKPOINT the wider gap left the peek reading as a
           page margin rather than as more row (owner, live render). */
        gap: ${theme.spacing.sm};

        > li {
          /* The grid's own column width at each of its breakpoints
             (components/LessonsGrid/styles.ts), computed rather than
             retyped (helpers.ts, railCardWidth), so the two cannot drift. */
          flex: 0 0 ${railCardWidth(theme, RAIL_COLUMNS_PHONE, railEdgeOffset(theme, 'gutter'))};
          scroll-snap-align: start;

          @media (min-width: ${theme.breakpoints.md}) {
            /* Held, not full: caps the 3-column card at 276px instead of
               letting it grow unbounded toward the naked formula's ~357px
               at 1199 before a 4th column lands (consts.ts,
               RAIL_HELD_BAND_WIDTH). This is the rail's own fix; syncing
               LessonsGrid to the same hold is a separate, deferred change
               (consts.ts, RAIL_FOUR_COL_BREAKPOINT). */
            flex-basis: ${railCardWidth(theme, RAIL_COLUMNS_MD, railEdgeOffset(theme, 'held'))};
          }

          @media (min-width: ${RAIL_FOUR_COL_BREAKPOINT}) {
            /* 'full', not 'held': at this column count the 'full' offset is
               what keeps the card growing continuously into the >= xl case
               instead of jumping at 1280 (see .scrollerWrap's margin-inline
               comment above for the numbers). */
            flex-basis: ${railCardWidth(theme, RAIL_COLUMNS_WIDE, railEdgeOffset(theme, 'full'))};
          }

          @media (min-width: ${theme.breakpoints.xl}) {
            flex-basis: ${railCardWidth(theme, RAIL_COLUMNS_XL, railEdgeOffset(theme, 'full'))};
          }
        }
      }
    }
  }
`,
);
