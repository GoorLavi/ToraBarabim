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
      color: ${theme.colors.text};
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

      /* Mirrors LessonCard/styles.ts's own ".audience" for the marked and
         chip treatments, so a course card beside a lesson card marks a
         mixed audience the same way; nowrap of its own (design gate round
         2 finding), since "גם גברים וגם נשים" must stay one phrase, never
         breaking mid-sentence the way its own normal spaces would allow. */
      > .audience {
        white-space: nowrap;

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
