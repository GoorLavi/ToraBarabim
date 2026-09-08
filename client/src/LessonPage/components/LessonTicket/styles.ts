import { css } from 'styled-components';

import {
  CARD_MAX_INLINE_SIZE_NO_POSTER_DESKTOP,
  CARD_MIN_BLOCK_SIZE_DESKTOP,
  NOTCH_DIAMETER,
  PANEL_BLOCK_PADDING_PHONE,
  PERFORATION_DASH,
  PERFORATION_GAP,
  PERFORATION_THICKNESS,
  POSTER_WIDTH_DESKTOP,
  POSTER_WIDTH_PHONE,
  STUB_DIVIDER_LENGTH_DESKTOP,
  STUB_WHEN_ROW_GAP_DESKTOP,
  TEXT_COLUMN_INLINE_PADDING_DESKTOP,
  TICKET_FINE_GAP,
} from './consts';

// The ticket's full look: split in two, one perforation line, two circular
// notches at its ends, radius `lg` like every other card (design spec, "The
// ticket, and where it stops"). Exported once and reused by
// `LessonTicketSkeleton`, whose empty `.stub`/`.body` render the same shape
// with no child text to fill it: the loading state is this same object, not
// a different one, per the spec's "completely static, no shimmer" note.
export const TicketShell = css(
  ({ theme }) => `
  inline-size: 100%;
  max-inline-size: ${theme.breakpoints.sm};
  margin-inline: auto;
  border-radius: ${theme.radii.lg};
  overflow: hidden;
  background: ${theme.colors.primary};

  /* Below \`lg\` the card keeps its narrow, phone-shaped proportions rather
     than stretching to the page's full content width with nothing to fill
     it: the row layout and the three typography steps below all move to
     \`lg\` together, so nothing here has to support a fourth in-between
     layout (design review, "nothing was designed between 768 and 1023").
     Centred rather than pinned to one side once it stops filling the row. */
  @media (min-width: ${theme.breakpoints.lg}) {
    max-inline-size: none;
    margin-inline: 0;
  }

  /* With no poster the main panel is text only, so the card stays narrow
     rather than stretching into a wide, mostly empty band (design spec,
     "No photo"). */
  &.noPoster {
    @media (min-width: ${theme.breakpoints.lg}) {
      max-inline-size: ${CARD_MAX_INLINE_SIZE_NO_POSTER_DESKTOP};
    }
  }

  > .cancelledBanner {
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    background: ${theme.colors.surface};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};

    > .heading {
      display: block;
      color: ${theme.colors.danger};
      font-weight: ${theme.typography.sectionHeading.fontWeight};
      font-size: ${theme.typography.sectionHeading.phone.fontSize};
      line-height: ${theme.typography.sectionHeading.phone.lineHeight};
    }

    > .reason {
      display: block;
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
    }
  }

  /* A cancelled ticket no longer dims its own text: the white banner above
     already carries the message, and 'textOnPrimaryMuted' at the old 0.55
     opacity falls under the 3:1 contrast floor on a screen whose whole job
     is to be screenshotted (design review). Gold still steps aside to white,
     since gold is reserved for a live start time. */
  &.cancelled > .ticketRow > .stub {
    /* The top notch on desktop sits directly beneath the cancellation
       banner, so the hole it fakes has to read as a hole through to the
       banner's own white, not through to the page background behind the
       rest of the card. */
    > .notch.start {
      @media (min-width: ${theme.breakpoints.lg}) {
        background: ${theme.colors.surface};
      }
    }

    > .whenRow > .timeCol > .time {
      color: ${theme.colors.textOnPrimary};
    }
  }

  > .ticketRow {
    display: flex;
    flex-direction: column;

    @media (min-width: ${theme.breakpoints.lg}) {
      flex-direction: row;
      /* The card hugs its own content and never stretches, but it does not
         shrink below this either (design spec, "Height hugs content with a
         floor of 380"). */
      min-block-size: ${CARD_MIN_BLOCK_SIZE_DESKTOP};
    }

    > .stub {
      position: relative;
      flex: 0 0 auto;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: ${theme.spacing.lg};
      padding-inline: ${theme.spacing.xl};
      padding-block: ${PANEL_BLOCK_PADDING_PHONE};

      @media (min-width: ${theme.breakpoints.lg}) {
        /* Fixed, never fluid: every pixel the card gains belongs to the
           main panel, not the stub (design spec). */
        flex: 0 0 200px;
        justify-content: center;
        padding-block: ${theme.spacing.xxl};
      }

      /* The perforation itself: a repeating gradient, not a dashed border,
         which cannot hold a 2px dash and a 6px gap this precisely across
         browsers. The gradient's own direction keyword does not encode a
         layout side: the pattern is periodic, so it tiles identically
         read from either end. */
      &::after {
        content: '';
        position: absolute;
        inset-inline: 0;
        inset-block-end: 0;
        block-size: ${PERFORATION_THICKNESS};
        background-image: repeating-linear-gradient(
          to right,
          ${theme.colors.borderOnPrimary} 0,
          ${theme.colors.borderOnPrimary} ${PERFORATION_DASH},
          transparent ${PERFORATION_DASH},
          transparent calc(${PERFORATION_DASH} + ${PERFORATION_GAP})
        );

        @media (min-width: ${theme.breakpoints.lg}) {
          inset-inline: auto;
          inset-inline-end: 0;
          inset-block: 0;
          inline-size: ${PERFORATION_THICKNESS};
          block-size: auto;
          background-image: repeating-linear-gradient(
            to bottom,
            ${theme.colors.borderOnPrimary} 0,
            ${theme.colors.borderOnPrimary} ${PERFORATION_DASH},
            transparent ${PERFORATION_DASH},
            transparent calc(${PERFORATION_DASH} + ${PERFORATION_GAP})
          );
        }
      }

      > .notch {
        position: absolute;
        inline-size: ${NOTCH_DIAMETER};
        block-size: ${NOTCH_DIAMETER};
        border-radius: ${theme.radii.pill};
        background: ${theme.colors.bg};
        inset-block-end: calc(${NOTCH_DIAMETER} / -2);

        @media (min-width: ${theme.breakpoints.lg}) {
          inset-block-end: auto;
        }

        /* Both notches sit on the perforation line at its two ends,
           whichever way the ticket turns: the horizontal position always
           matches the perforation (the stub/body boundary), only the
           block-axis position (top versus bottom) differs. */
        &.start {
          inset-inline-start: calc(${NOTCH_DIAMETER} / -2);

          @media (min-width: ${theme.breakpoints.lg}) {
            inset-inline-start: auto;
            inset-inline-end: calc(${NOTCH_DIAMETER} / -2);
            inset-block-start: calc(${NOTCH_DIAMETER} / -2);
          }
        }

        &.end {
          inset-inline-end: calc(${NOTCH_DIAMETER} / -2);

          @media (min-width: ${theme.breakpoints.lg}) {
            inset-block-end: calc(${NOTCH_DIAMETER} / -2);
          }
        }
      }

      > .kicker {
        color: ${theme.colors.textOnPrimaryMuted};
        font-weight: ${theme.typography.tagAndCaption.fontWeight};
        font-size: ${theme.typography.tagAndCaption.phone.fontSize};
        line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
        overflow-wrap: break-word;
      }

      > .whenRow {
        display: flex;
        align-items: stretch;
        justify-content: space-between;

        /* The frame's desktop stub is one column: kicker, then the date
           block, a short rule, then the time block, stacked rather than
           side by side (design review, "the desktop stub kept the phone's
           layout"). */
        @media (min-width: ${theme.breakpoints.lg}) {
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-start;
          gap: ${STUB_WHEN_ROW_GAP_DESKTOP};
        }

        > .dateCol,
        > .timeCol {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: ${theme.spacing.xs};
        }

        /* A full-height vertical rule between the two columns on a phone;
           on the desktop's single column it becomes a short horizontal one
           between the stacked date and time blocks. Its own size comes
           from the parent's \`align-items\`, stretching to fill the row's
           cross axis on a phone and sitting at its own fixed size once the
           row becomes a column. */
        > .hairline {
          flex: 0 0 auto;
          inline-size: 1px;
          background: ${theme.colors.borderOnPrimary};

          @media (min-width: ${theme.breakpoints.lg}) {
            inline-size: ${STUB_DIVIDER_LENGTH_DESKTOP};
            block-size: 1px;
          }
        }

        > .dateCol > .weekday,
        > .timeCol > .duration {
          color: ${theme.colors.textOnPrimaryMuted};
          font-weight: ${theme.typography.tagAndCaption.fontWeight};
          font-size: ${theme.typography.tagAndCaption.phone.fontSize};
          line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
        }

        > .dateCol > .day {
          color: ${theme.colors.textOnPrimary};
          font-weight: ${theme.typography.ticketDate.fontWeight};
          font-size: ${theme.typography.ticketDate.phone.fontSize};
          line-height: ${theme.typography.ticketDate.phone.lineHeight};

          @media (min-width: ${theme.breakpoints.lg}) {
            font-size: ${theme.typography.ticketDate.desktop.fontSize};
            line-height: ${theme.typography.ticketDate.desktop.lineHeight};
          }
        }

        > .dateCol > .month,
        > .timeCol > .endTime {
          color: ${theme.colors.textOnPrimaryMuted};
          font-size: ${theme.typography.secondary.phone.fontSize};
          line-height: ${theme.typography.secondary.phone.lineHeight};
        }

        > .timeCol > .time {
          color: ${theme.colors.accentOnDark};
          font-weight: ${theme.typography.ticketTime.fontWeight};
          font-size: ${theme.typography.ticketTime.phone.fontSize};
          line-height: ${theme.typography.ticketTime.phone.lineHeight};

          @media (min-width: ${theme.breakpoints.lg}) {
            font-size: ${theme.typography.ticketTime.desktop.fontSize};
            line-height: ${theme.typography.ticketTime.desktop.lineHeight};
          }
        }
      }
    }

    /* Two blocks, not one column: where the lesson is, then who teaches it
       beside their poster (design review, "the lower panel's order is
       inverted and its two blocks have merged into one"). The venue is the
       one line a person going out tonight actually needs, so it leads. */
    > .body {
      flex: 1;
      min-inline-size: 0;
      /* The desktop poster is positioned absolutely against this box, so it
         can span the panel's full height (see \`.poster\` below) while
         staying nested beside the teacher text it needs to sit next to on a
         phone, where it is not absolutely positioned. */
      position: relative;
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.xl};
      padding-inline: ${theme.spacing.xl};
      padding-block: ${PANEL_BLOCK_PADDING_PHONE};

      @media (min-width: ${theme.breakpoints.lg}) {
        flex: 1 1 auto;
        /* Centres the place block, the hairline and the teacher block as one
           unit, so any slack the 380 floor leaves splits evenly above and
           below the whole stack instead of opening a gap inside it (design
           spec, "not space-between: this is the other half of the fix"). */
        justify-content: center;
        padding-inline: ${TEXT_COLUMN_INLINE_PADDING_DESKTOP} calc(${POSTER_WIDTH_DESKTOP} + ${TEXT_COLUMN_INLINE_PADDING_DESKTOP});
        padding-block: ${theme.spacing.xxl};
      }

      &.noPoster {
        @media (min-width: ${theme.breakpoints.lg}) {
          padding-inline-end: ${TEXT_COLUMN_INLINE_PADDING_DESKTOP};
        }
      }

      > .place {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: ${theme.spacing.xs};

        @media (min-width: ${theme.breakpoints.lg}) {
          gap: 0;
        }
      }

      > .place > .venue {
        color: ${theme.colors.textOnPrimary};
        font-weight: ${theme.typography.ticketVenue.fontWeight};
        font-size: ${theme.typography.ticketVenue.phone.fontSize};
        line-height: ${theme.typography.ticketVenue.phone.lineHeight};
        overflow-wrap: break-word;

        @media (min-width: ${theme.breakpoints.lg}) {
          font-size: ${theme.typography.ticketVenue.desktop.fontSize};
          line-height: ${theme.typography.ticketVenue.desktop.lineHeight};
          margin-block-end: ${theme.spacing.xs};
        }
      }

      > .place > .city {
        color: ${theme.colors.textOnPrimaryMuted};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
        overflow-wrap: break-word;

        @media (min-width: ${theme.breakpoints.lg}) {
          margin-block-end: ${theme.spacing.lg};
        }
      }

      /* An address never wraps: a Hebrew line with digits in it can flip a
         house number to the wrong side at the break (design-system.md,
         "Hebrew and right-to-left"). It stays on one line and truncates
         instead. */
      > .place > .address {
        inline-size: 100%;
        color: ${theme.colors.textOnPrimaryMuted};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        @media (min-width: ${theme.breakpoints.lg}) {
          margin-block-end: ${TICKET_FINE_GAP};
        }
      }

      /* A classification, styled as a small raised block: it earns the pill
         the substitute's clarification below does not. */
      > .place > .audienceTag {
        display: inline-flex;
        width: fit-content;
        padding-block: ${TICKET_FINE_GAP};
        padding-inline: ${theme.spacing.sm};
        border-radius: ${theme.radii.sm};
        background: ${theme.colors.surfaceOnPrimary};
        color: ${theme.colors.textOnPrimary};
        font-weight: ${theme.typography.tagAndCaption.fontWeight};
        font-size: ${theme.typography.tagAndCaption.phone.fontSize};
        line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
      }

      /* The rule that replaces the old gap between the audience tag and the
         teacher block: a deliberate line, not an ambiguous void (design
         spec, phone correction 2; desktop, "what replaces the canyon"). */
      > .hairline {
        flex: 0 0 auto;
        inline-size: 100%;
        block-size: 1px;
        background: ${theme.colors.borderOnPrimary};
      }

      > .teacherRow {
        display: flex;
        align-items: flex-start;
        gap: ${theme.spacing.lg};
      }

      > .teacherRow > .teacher {
        flex: 1;
        min-inline-size: 0;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: ${theme.spacing.xs};

        @media (min-width: ${theme.breakpoints.lg}) {
          gap: 0;
        }
      }

      /* With no poster the teacher block is the only content in its row: it
         takes the full width rather than hugging the inline-start edge and
         leaving the rest of the card empty. */
      &.noPoster > .teacherRow > .teacher {
        align-items: stretch;
      }

      > .teacherRow > .teacher > .role {
        color: ${theme.colors.textOnPrimaryMuted};
        font-weight: ${theme.typography.tagAndCaption.fontWeight};
        font-size: ${theme.typography.tagAndCaption.phone.fontSize};
        line-height: ${theme.typography.tagAndCaption.phone.lineHeight};

        @media (min-width: ${theme.breakpoints.lg}) {
          margin-block-end: ${theme.spacing.xs};
        }
      }

      /* A clarification, not a classification: plain text beside the role
         it qualifies, never the audience tag's raised pill. */
      > .teacherRow > .teacher > .substituteTag {
        color: ${theme.colors.textOnPrimaryMuted};
        font-size: ${theme.typography.tagAndCaption.phone.fontSize};
        line-height: ${theme.typography.tagAndCaption.phone.lineHeight};

        @media (min-width: ${theme.breakpoints.lg}) {
          margin-block-end: ${theme.spacing.xs};
        }
      }

      /* Card title, not Section heading: the venue above is the one line a
         person going out tonight actually needs, and a louder rabbi name
         would outrank it (design spec). */
      > .teacherRow > .teacher > .name {
        color: ${theme.colors.textOnPrimary};
        font-weight: ${theme.typography.cardTitle.fontWeight};
        font-size: ${theme.typography.cardTitle.phone.fontSize};
        line-height: ${theme.typography.cardTitle.phone.lineHeight};
        overflow-wrap: break-word;

        @media (min-width: ${theme.breakpoints.lg}) {
          margin-block-end: ${TICKET_FINE_GAP};
        }
      }

      > .teacherRow > .teacher > .title {
        color: ${theme.colors.textOnPrimaryMuted};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
        overflow-wrap: break-word;
      }

      /* Bleeds past the panel's own padding to the card's inline-end and
         block-end edges on a phone, clipped into the rounded corner by the
         shell's own \`overflow: hidden\`. On desktop it bleeds to all three
         outer edges instead (top, bottom, inline-end) and spans the panel's
         full height, which a phone-style fixed aspect ratio cannot do: the
         poster does not contribute to the card's height, so it is taken out
         of flow and sized against \`.body\` directly (design spec, "The
         poster does not contribute to H"). */
      > .teacherRow > .poster {
        flex: 0 0 auto;
        inline-size: ${POSTER_WIDTH_PHONE};
        aspect-ratio: 3 / 4;
        object-fit: cover;
        margin-inline-end: calc(-1 * ${theme.spacing.xl});
        margin-block-end: calc(-1 * ${PANEL_BLOCK_PADDING_PHONE});

        @media (min-width: ${theme.breakpoints.lg}) {
          position: absolute;
          inset-block: 0;
          inset-inline-end: 0;
          inline-size: ${POSTER_WIDTH_DESKTOP};
          block-size: 100%;
          object-position: center top;
          margin: 0;
        }
      }
    }
  }
`,
);
