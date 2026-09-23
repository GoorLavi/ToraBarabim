import { css } from 'styled-components';

export const CityPage = css(
  ({ theme }) => `
  /* No content-band cap: this page's own lesson grid (DayGroup, wrapping
     components/LessonsGrid) caps its cards at their own fixed ceiling
     instead of the page capping its width, so the column count grows with
     the viewport rather than the margins (owner-approved reversal, for
     lesson-grid pages, of the sitewide 1280 cap; design-system.md,
     "Maximum content width 1280px" and the LessonsGrid rollout note).
     Nothing else on this page needs a narrower band: the heading is plain
     text and RabbiRail bounds itself regardless of its ancestor's width. */
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
