import { css } from 'styled-components';

import { contentBandCap } from '~/styles/contentBand';

export const AreaPage = css(
  ({ theme }) => `
  /* No content-band cap on the page itself: this page's own lesson grid
     (DayGroup, wrapping components/LessonsGrid) caps its cards at their own
     fixed ceiling instead of the page capping its width, so the column
     count grows with the viewport rather than the margins (owner-approved
     reversal, for lesson-grid pages, of the sitewide 1280 cap;
     design-system.md, "Maximum content width 1280px" and the LessonsGrid
     rollout note). The heading is plain text and needs nothing. The cities
     grid below is not a lesson grid and its columns are fractional
     (1fr), so it keeps the sitewide cap on its own, below, or it would
     stretch its cells edge to edge on a wide screen. */
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

  > .citiesSection {
    ${contentBandCap(theme)}
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};

    @media (min-width: ${theme.breakpoints.md}) {
      gap: ${theme.spacing.lg};
    }

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

    > .grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: ${theme.spacing.md};
      align-items: stretch;

      @media (min-width: ${theme.breakpoints.md}) {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: ${theme.spacing.lg};
      }

      @media (min-width: ${theme.breakpoints.xl}) {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }

      > .cell {
        display: block;
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
