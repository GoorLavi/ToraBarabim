import { css } from 'styled-components';

import { POSTER_WIDTH_DESKTOP, POSTER_WIDTH_PHONE } from '~/LessonPage/components/LessonTicket/consts';

// Adds the skeleton's own bars and blocks on top of `TicketShell` (applied
// alongside this at the component's own tagged template, not embedded here:
// a `css()` block cannot be spliced into another via a plain JS template
// string, only via a real tagged-template interpolation). Every `.bar`
// below is a plain fill, sized to stand in for the line it precedes; the
// darker fills (`.day`, `.time`, `.name`, `.venue`, `.poster`) mark the
// card's hero content.
export const LessonTicketSkeleton = css(
  ({ theme }) => `
  > .ticketRow {
    > .stub {
      @media (min-width: ${theme.breakpoints.lg}) {
        min-inline-size: 220px;
      }

      /* Not \`>\`: these bars sit at every depth under .stub (the date and
         time columns nest two levels deep), so this reaches all of them. */
      .bar {
        display: block;
        border-radius: ${theme.radii.sm};
        background: ${theme.colors.borderOnPrimary};
      }

      > .kicker {
        inline-size: 120px;
        block-size: 18px;
      }

      > .whenRow > .dateCol {
        > .weekday {
          inline-size: 56px;
          block-size: 14px;
        }

        > .day {
          inline-size: 48px;
          block-size: 48px;
          background: ${theme.colors.surfaceOnPrimary};
        }

        > .month {
          inline-size: 64px;
          block-size: 15px;
        }
      }

      > .whenRow > .timeCol {
        > .time {
          inline-size: 64px;
          block-size: 36px;
          background: ${theme.colors.surfaceOnPrimary};
        }

        > .endTime {
          inline-size: 56px;
          block-size: 15px;
        }

        > .duration {
          inline-size: 72px;
          block-size: 14px;
        }
      }
    }

    > .body {
      .bar {
        display: block;
        border-radius: ${theme.radii.sm};
        background: ${theme.colors.borderOnPrimary};
      }

      /* Two full-width lines and one short one, not three stepping in from
         the start: a staircase of shrinking widths reads as decoration,
         where a full line reads as a paragraph waiting to appear (design
         review, "the body skeleton's three bars step in from the start"). */
      > .place > .venue {
        inline-size: 100%;
        block-size: 18px;
        background: ${theme.colors.surfaceOnPrimary};
      }

      > .place > .address {
        inline-size: 100%;
        block-size: 15px;
      }

      > .place > .city {
        inline-size: 220px;
        block-size: 15px;
      }

      > .place > .tag {
        inline-size: 72px;
        block-size: 18px;
      }

      > .teacherRow > .teacher > .role {
        inline-size: 90px;
        block-size: 14px;
      }

      > .teacherRow > .teacher > .name {
        inline-size: 70%;
        block-size: 22px;
        background: ${theme.colors.surfaceOnPrimary};
      }

      > .teacherRow > .poster {
        flex: 0 0 auto;
        display: block;
        inline-size: ${POSTER_WIDTH_PHONE};
        aspect-ratio: 3 / 4;
        border-radius: ${theme.radii.sm};
        background: ${theme.colors.surfaceOnPrimary};

        @media (min-width: ${theme.breakpoints.lg}) {
          inline-size: ${POSTER_WIDTH_DESKTOP};
        }
      }
    }
  }
`,
);
