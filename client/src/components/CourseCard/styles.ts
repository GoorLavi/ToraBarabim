import { css } from 'styled-components';

import { CARD_WIDE_THRESHOLD } from '~/consts';
import { POSTER_ASPECT_RATIO } from '~/HomePage/consts';

import { CARD_DATE_COMPACT_THRESHOLD, CARD_DATE_SEMIBOLD_THRESHOLD } from './consts';

// Mirrors LessonCard/styles.ts exactly (design-system.md, "the lesson
// tile's exact size in every rail tier"): same poster ratio, same body
// padding and type steps, so the two card kinds sit at identical heights in
// a row that mixes them. Only the poster's own corner mark and the body's
// text lines differ.
export const CourseCard = css(
  ({ theme }) => `
  container-type: inline-size;
  display: flex;
  flex-direction: column;
  block-size: 100%;
  overflow: hidden;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.surface};
  box-shadow: ${theme.shadows.card};
  color: inherit;
  text-decoration: none;
  transition: border-color 150ms ease;

  &:focus-visible {
    outline: 2px solid ${theme.colors.primary};
    outline-offset: 2px;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      border-color: ${theme.colors.primary};
    }
  }

  > .poster {
    position: relative;
    overflow: hidden;
    aspect-ratio: ${POSTER_ASPECT_RATIO};
    flex-shrink: 0;
    background: ${theme.colors.primarySoft};

    > .image {
      inline-size: 100%;
      block-size: 100%;
      object-fit: cover;
    }

    /* The two-line seal LessonCard's own date medallion draws from
       (HomePage/components/LessonCard/styles.ts, ".medallion"): the small
       qualifying word over the big state word, in the same corner box. */
    > .stateTag {
      position: absolute;
      inset-block-start: ${theme.spacing.sm};
      inset-inline-end: ${theme.spacing.sm};
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-block: ${theme.spacing.xs};
      padding-inline: ${theme.spacing.sm};
      border: 1px solid ${theme.colors.accentOnDark};
      border-radius: ${theme.radii.sm};
      background: ${theme.colors.primary};
      color: ${theme.colors.textOnPrimary};

      > .small {
        font-weight: ${theme.typography.fontWeight.regular};
        font-size: ${theme.typography.tagAndCaption.phone.fontSize};
        line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
      }

      > .big {
        font-weight: ${theme.typography.fontWeight.bold};
        font-size: ${theme.typography.tagAndCaption.phone.fontSize};
        line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
      }

      /* The two closed reasons get a gold rule between the two words, so a
         closed course reads as a real, designed state rather than a plain
         tag (spec section 7, "designed as a real state... beautiful"). */
      &.closed > .rule {
        inline-size: 100%;
        block-size: 1px;
        margin-block: 2px;
        background: ${theme.colors.accentOnDark};
      }
    }
  }

  > .body {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
    padding: ${theme.spacing.md};

    > .title {
      font-size: ${theme.typography.cardTitleCompact.phone.fontSize};
      line-height: ${theme.typography.cardTitleCompact.phone.lineHeight};
      font-weight: ${theme.typography.cardTitleCompact.fontWeight};
      color: ${theme.colors.text};
      overflow-wrap: break-word;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      @container (min-inline-size: ${CARD_WIDE_THRESHOLD}) {
        font-size: ${theme.typography.cardTitle.phone.fontSize};
        line-height: ${theme.typography.cardTitle.phone.lineHeight};
        font-weight: ${theme.typography.cardTitle.fontWeight};
      }
    }

    > .teacher {
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.secondaryCompact.phone.fontSize};
      line-height: ${theme.typography.secondaryCompact.phone.lineHeight};
      overflow-wrap: break-word;

      @container (min-inline-size: ${CARD_WIDE_THRESHOLD}) {
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }
    }

    > .opening {
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.secondaryCompact.phone.fontSize};
      line-height: ${theme.typography.secondaryCompact.phone.lineHeight};

      > .compact {
        display: none;
      }

      /* Below its own compact threshold the long form ("3 בנובמבר") crowds
         a narrow phone-tier card, so a numeric form ("17.11") replaces it
         there instead of shrinking further (design-system.md, "no other
         request to go below 14 [px]"). */
      @container (max-inline-size: ${CARD_DATE_COMPACT_THRESHOLD}) {
        > .long {
          display: none;
        }

        > .compact {
          display: inline;
        }
      }

      @container (min-inline-size: ${CARD_WIDE_THRESHOLD}) {
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }

      /* From here the date reads as the card's own second hero value
         (design gate finding), not just another secondary line. */
      @container (min-inline-size: ${CARD_DATE_SEMIBOLD_THRESHOLD}) {
        color: ${theme.colors.text};
        font-weight: ${theme.typography.fontWeight.semiBold};
      }
    }

    > .meta {
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.secondaryCompact.phone.fontSize};
      line-height: ${theme.typography.secondaryCompact.phone.lineHeight};
      overflow-wrap: break-word;

      @container (min-inline-size: ${CARD_WIDE_THRESHOLD}) {
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }

      /* Mirrors LessonCard/styles.ts's own ".audience" exactly, so a course
         card beside a lesson card marks a mixed audience the same way. */
      > .audience {
        &.marked {
          color: ${theme.colors.text};
          font-weight: ${theme.typography.fontWeight.semiBold};
        }

        &.chip {
          padding-block: 2px;
          padding-inline: ${theme.spacing.xs};
          border: 1px solid ${theme.colors.primary};
          border-radius: ${theme.radii.sm};
          background: ${theme.colors.primarySoft};
          color: ${theme.colors.primary};
          font-weight: ${theme.typography.fontWeight.semiBold};
        }
      }
    }
  }
`,
);
