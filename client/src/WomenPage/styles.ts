import { css } from 'styled-components';

export const WomenPage = css(
  ({ theme }) => `
  /* No content-band cap: this page's own lesson grid (DayGroup, wrapping
     components/LessonsGrid) caps its cards at their own fixed ceiling
     instead of the page capping its width, so the column count grows with
     the viewport rather than the margins (owner-approved reversal, for
     lesson-grid pages, of the sitewide 1280 cap; design-system.md,
     "Maximum content width 1280px" and the LessonsGrid rollout note).
     Nothing else on this page needs a narrower band: the heading is plain
     text, and RabbiRail and the citiesRail (fixed-width chips in a
     scrolling row) both bound themselves regardless of their ancestor's
     width. */
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

  > .title {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: ${theme.spacing.xs};

    > .heading {
      font-size: ${theme.typography.pageHeading.phone.fontSize};
      line-height: ${theme.typography.pageHeading.phone.lineHeight};
      font-weight: ${theme.typography.pageHeading.fontWeight};
      color: ${theme.colors.text};
      overflow-wrap: break-word;

      @media (min-width: ${theme.breakpoints.md}) {
        font-size: ${theme.typography.pageHeading.desktop.fontSize};
        line-height: ${theme.typography.pageHeading.desktop.lineHeight};
      }
    }

    > .sub {
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
      color: ${theme.colors.textSecondary};

      @media (min-width: ${theme.breakpoints.md}) {
        font-size: ${theme.typography.body.phone.fontSize};
        line-height: ${theme.typography.body.phone.lineHeight};
      }
    }

    > .pendingCue {
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.tagAndCaption.phone.fontSize};
      line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
    }
  }

  > .citiesSection {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};

    > .heading {
      color: ${theme.colors.text};
      font-weight: ${theme.typography.sectionHeading.fontWeight};
      font-size: ${theme.typography.sectionHeading.phone.fontSize};
      line-height: ${theme.typography.sectionHeading.phone.lineHeight};

      @media (min-width: ${theme.breakpoints.md}) {
        font-size: ${theme.typography.sectionHeading.desktop.fontSize};
        line-height: ${theme.typography.sectionHeading.desktop.lineHeight};
      }
    }

    > .citiesRail {
      display: flex;
      gap: ${theme.spacing.md};
      align-items: stretch;
      overflow-x: auto;
      overscroll-behavior-inline: contain;
      /* Cancels the page gutter and re-applies it as end padding, so the
         rail runs full-bleed while the first chip still lines up under the
         heading (design-system.md, "A horizontally scrolling row runs full
         width"). */
      margin-inline: calc(-1 * ${theme.spacing.lg});
      padding-inline: ${theme.spacing.lg};
      scrollbar-width: none;

      @media (min-width: ${theme.breakpoints.md}) {
        margin-inline: calc(-1 * ${theme.spacing.xl});
        padding-inline: ${theme.spacing.xl};
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

      > .cell {
        flex: 0 0 auto;
        /* Off scale, wide enough for a real city name and count without
           crowding the row. */
        inline-size: 160px;
      }
    }
  }

  > .loadMore {
    align-self: stretch;

    @media (min-width: ${theme.breakpoints.lg}) {
      align-self: flex-end;
      inline-size: 240px;
    }
  }
`,
);
