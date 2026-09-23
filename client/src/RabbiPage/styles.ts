import { css } from 'styled-components';

import { contentBandCap } from '~/styles/contentBand';

export const RabbiPage = css(
  ({ theme }) => `
  /* No content-band cap on the page itself: the nationwide fallback grid
     shown when a rabbi has no lessons of their own (RabbiEmptyLessons,
     wrapping components/LessonsGrid) caps its cards at their own fixed
     ceiling instead of the page capping its width, so the column count
     grows with the viewport rather than the margins (owner-approved
     reversal, for lesson-grid pages, of the sitewide 1280 cap;
     design-system.md, "Maximum content width 1280px" and the LessonsGrid
     rollout note). The hero and bio below are not a lesson grid, and the
     hero's name column is flexible text rather than a fixed-width card, so
     that section keeps the sitewide cap on its own, below, or a rabbi's
     name and bio would stretch to an unreadable line length on a wide
     screen. */
  padding-inline: ${theme.spacing.lg};
  padding-block: ${theme.spacing.lg} ${theme.spacing.xxl};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};

  @media (min-width: ${theme.breakpoints.md}) {
    padding-inline: ${theme.spacing.xl};
    padding-block: ${theme.spacing.xl} ${theme.spacing.xxxl};
    gap: ${theme.spacing.xxl};
  }

  > .top {
    ${contentBandCap(theme)}
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: ${theme.spacing.xl};

    @media (min-width: ${theme.breakpoints.lg}) {
      flex-direction: row;
      align-items: flex-start;
      gap: ${theme.spacing.xxl};
    }

    > *:first-child {
      @media (min-width: ${theme.breakpoints.lg}) {
        flex: 1 1 0%;
        min-inline-size: 0;
      }
    }

    > .bio {
      max-inline-size: 640px;

      @media (min-width: ${theme.breakpoints.lg}) {
        flex: 0 0 360px;
        max-inline-size: 360px;
      }

      > .text {
        font-size: ${theme.typography.body.phone.fontSize};
        line-height: ${theme.typography.body.phone.lineHeight};
        color: ${theme.colors.text};
        white-space: pre-line;
        overflow-wrap: break-word;
      }
    }
  }
`,
);
