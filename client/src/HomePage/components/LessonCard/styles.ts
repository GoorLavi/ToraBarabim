import { css } from 'styled-components';

import { POSTER_ASPECT_RATIO } from '~/HomePage/consts';

import { CANCELLED_LABEL_BOTTOM_THRESHOLD, CARD_WIDE_THRESHOLD } from './consts';

export const LessonCard = css(
  ({ theme }) => `
  container-type: inline-size;
  display: flex;
  flex-direction: column;
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

  /* Only the portrait dims: the cancelled label and the rest of the card's
     text stay at full strength, since a faded cancellation notice reads as
     the opposite of what it is for. */
  &.cancelled > .poster > .image {
    opacity: 0.7;
  }

  > .poster {
    position: relative;
    overflow: hidden;
    aspect-ratio: ${POSTER_ASPECT_RATIO};
    background: ${theme.colors.primarySoft};

    > .image {
      inline-size: 100%;
      block-size: 100%;
      object-fit: cover;

      &.placeholder {
        background: ${theme.colors.primarySoft};
      }
    }

    > .cancelledLabel {
      position: absolute;
      /* Below CANCELLED_LABEL_BOTTOM_THRESHOLD the medallion already owns
         the top edge's other corner and there isn't room for both at the
         top, so this starts at the bottom; from that width up it moves to
         the top instead, same 8px insets either way. */
      inset-block-end: ${theme.spacing.sm};
      /* The page's own inline-start (the right, in RTL), the corner the
         medallion moved out of: no local \`dir\` override here either, so
         this also resolves against the real page direction. */
      inset-inline-start: ${theme.spacing.sm};
      padding-block: ${theme.spacing.xs};
      padding-inline: ${theme.spacing.sm};
      border-radius: ${theme.radii.sm};
      background: ${theme.colors.primary};
      color: ${theme.colors.textOnPrimary};
      font-weight: ${theme.typography.tagAndCaption.fontWeight};
      font-size: ${theme.typography.tagAndCaption.phone.fontSize};
      line-height: ${theme.typography.tagAndCaption.phone.lineHeight};

      @container (min-inline-size: ${CANCELLED_LABEL_BOTTOM_THRESHOLD}) {
        inset-block-start: ${theme.spacing.sm};
        inset-block-end: auto;
      }
    }

    > .medallion {
      position: absolute;
      inset-block-start: ${theme.spacing.sm};
      /* The page's own inline-end (the left, in RTL): only the time text
         carries its own \`dir="ltr"\` for the digits, not this element, so
         this resolves against the real page direction rather than a local
         override that would put it on the opposite physical side. */
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

      > .weekday {
        font-size: ${theme.typography.tagAndCaption.phone.fontSize};
        line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
        font-weight: ${theme.typography.fontWeight.regular};
      }

      > .time {
        font-size: ${theme.typography.timeInCard.phone.fontSize};
        line-height: ${theme.typography.timeInCard.phone.lineHeight};
        font-weight: ${theme.typography.timeInCard.fontWeight};
      }
    }
  }

  > .body {
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
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;

      @container (min-inline-size: ${CARD_WIDE_THRESHOLD}) {
        font-size: ${theme.typography.cardTitle.phone.fontSize};
        line-height: ${theme.typography.cardTitle.phone.lineHeight};
        font-weight: ${theme.typography.cardTitle.fontWeight};
      }
    }

    > .meta {
      font-size: ${theme.typography.secondaryCompact.phone.fontSize};
      line-height: ${theme.typography.secondaryCompact.phone.lineHeight};
      overflow-wrap: break-word;

      @container (min-inline-size: ${CARD_WIDE_THRESHOLD}) {
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }

      > .audience {
        display: inline-block;
        color: ${theme.colors.textSecondary};
        font-weight: ${theme.typography.fontWeight.regular};

        &.marked {
          color: ${theme.colors.text};
          font-weight: ${theme.typography.fontWeight.semiBold};
        }

        /* Never truncates: a long audience string wraps onto a second line
           rather than losing text. */
        &.chip {
          /* Off the 4px spacing scale, measured against the chip's own
             14/20 text so the pill reads as a tag rather than a button. */
          padding-block: 2px;
          padding-inline: ${theme.spacing.xs};
          border: 1px solid ${theme.colors.primary};
          border-radius: ${theme.radii.sm};
          background: ${theme.colors.primarySoft};
          color: ${theme.colors.primary};
          font-weight: ${theme.typography.fontWeight.semiBold};
          white-space: normal;
        }
      }

      > .description {
        color: ${theme.colors.textSecondary};
      }
    }

    > .city {
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.secondaryCompact.phone.fontSize};
      line-height: ${theme.typography.secondaryCompact.phone.lineHeight};
      overflow-wrap: break-word;

      @container (min-inline-size: ${CARD_WIDE_THRESHOLD}) {
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }
    }

    > .substituteNote {
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.secondaryCompact.phone.fontSize};
      line-height: ${theme.typography.secondaryCompact.phone.lineHeight};

      @container (min-inline-size: ${CARD_WIDE_THRESHOLD}) {
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }
    }
  }
`,
);
