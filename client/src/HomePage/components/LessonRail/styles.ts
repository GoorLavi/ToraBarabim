import { css } from 'styled-components';

import { CARD_WIDTH_LG, CARD_WIDTH_MD, CARD_WIDTH_PHONE } from './consts';

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
    /* Cancels .content's own padding-inline exactly, so the scroller reaches
       the same edge .content itself reaches: the viewport edge below the
       1120px content cap, the content column's edge above it. */
    margin-inline: calc(-1 * ${theme.spacing.lg});

    @media (min-width: ${theme.breakpoints.md}) {
      margin-inline: calc(-1 * ${theme.spacing.xl});
    }

    > .arrow {
      display: none;

      @media (min-width: ${theme.breakpoints.lg}) {
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        z-index: 1;
        /* Centred on the poster (aspect-ratio 3/4 at \`${CARD_WIDTH_LG}\`
           wide, the card width at this breakpoint), not on the whole card:
           50% of \`.scrollerWrap\` centred on the card's text body too and
           landed the arrows in the poster's lower third (design review,
           item 11). */
        inset-block-start: calc(${CARD_WIDTH_LG} * 4 / 3 / 2 - 24px);
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

    > .scroller {
      display: flex;
      gap: ${theme.spacing.md};
      overflow-x: auto;
      overscroll-behavior-inline: contain;
      scroll-snap-type: inline proximity;
      padding-inline: ${theme.spacing.lg};
      scroll-padding-inline-start: ${theme.spacing.lg};
      scrollbar-width: none;

      @media (min-width: ${theme.breakpoints.md}) {
        gap: ${theme.spacing.lg};
        padding-inline: ${theme.spacing.xl};
        scroll-padding-inline-start: ${theme.spacing.xl};
      }

      /* Below \`lg\` the scroller reaches the true viewport edge, so the cut
         card already reads as "more off-screen". Above it, \`.scrollerWrap\`
         stops at the 1120px content column and a card can be sliced with
         page background on both sides, which reads as a rendering fault
         rather than an intentional edge (design review, item 4). The fade
         is a mirror-symmetric transparent/opaque/opaque/transparent stop
         sequence, so the physical "to right" keyword below renders
         identically regardless of direction; it does not encode left or
         right, only where along the row the fade sits. */
      @media (min-width: ${theme.breakpoints.lg}) {
        -webkit-mask-image: linear-gradient(
          to right,
          transparent,
          black ${theme.spacing.xxl},
          black calc(100% - ${theme.spacing.xxl}),
          transparent
        );
        mask-image: linear-gradient(
          to right,
          transparent,
          black ${theme.spacing.xxl},
          black calc(100% - ${theme.spacing.xxl}),
          transparent
        );
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

      > li {
        flex: 0 0 ${CARD_WIDTH_PHONE};
        scroll-snap-align: start;

        @media (min-width: ${theme.breakpoints.md}) {
          flex-basis: ${CARD_WIDTH_MD};
        }

        @media (min-width: ${theme.breakpoints.lg}) {
          flex-basis: ${CARD_WIDTH_LG};
        }
      }
    }
  }
`,
);
