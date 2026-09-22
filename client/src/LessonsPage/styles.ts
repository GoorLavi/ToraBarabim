import { css } from 'styled-components';

// This page's own block-to-block gap and title-block gap: 20px and 2px,
// neither of which matches a spacing token (the scale is
// 4/8/12/16/24/32/48/64). Measured off the frame as drawn rather than
// flattened to the nearest token (05-lessons.md, "the content column").
const CONTENT_GAP = '20px';
const TITLE_BLOCK_GAP = '2px';

export const LessonsPage = css(
  ({ theme }) => `
  /* No content-band cap: this page is one lesson grid (components/
     LessonsGrid) end to end, which caps its cards at their own fixed
     ceiling instead of the page capping its width, so the column count
     grows with the viewport rather than the margins (owner-approved
     reversal, for lesson-grid pages, of the sitewide 1280 cap;
     design-system.md, "Maximum content width 1280px" and the LessonsGrid
     rollout note). A plain, constant gutter replaces contentGutterInline's
     own drop-to-zero-above-1328 behaviour, which existed only to hand the
     saved padding to that cap's centring margin: with no cap here there is
     nothing to hand it to, and the gutter has to hold at every width. */
  padding-inline: ${theme.spacing.lg};
  padding-block: ${theme.spacing.xl} ${theme.spacing.xxl};
  display: flex;
  flex-direction: column;
  gap: ${CONTENT_GAP};

  @media (min-width: ${theme.breakpoints.md}) {
    padding-inline: ${theme.spacing.xl};
    padding-block-end: ${theme.spacing.xxxl};
    gap: ${theme.spacing.xl};
  }

  > .titleBlock {
    display: flex;
    flex-direction: column;
    gap: ${TITLE_BLOCK_GAP};
  }

  > .title {
    color: ${theme.colors.text};
    font-weight: ${theme.typography.pageHeading.fontWeight};
    font-size: ${theme.typography.pageHeading.phone.fontSize};
    line-height: ${theme.typography.pageHeading.phone.lineHeight};

    @media (min-width: ${theme.breakpoints.md}) {
      font-size: ${theme.typography.pageHeading.desktop.fontSize};
      line-height: ${theme.typography.pageHeading.desktop.lineHeight};
    }
  }

  > .subtitle {
    color: ${theme.colors.textSecondary};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }

  > .dayHeading {
    color: ${theme.colors.text};
    font-weight: ${theme.typography.sectionHeading.fontWeight};
    font-size: ${theme.typography.sectionHeading.phone.fontSize};
    line-height: ${theme.typography.sectionHeading.phone.lineHeight};

    @media (min-width: ${theme.breakpoints.md}) {
      font-size: ${theme.typography.sectionHeading.desktop.fontSize};
      line-height: ${theme.typography.sectionHeading.desktop.lineHeight};
    }
  }

  /* Full width on a phone, a fixed 240 at the row's inline end from
     \`md\` up (05-lessons.md: "the phone puts it full width and desktop
     puts it at the inline end"). */
  > .loadMore {
    align-self: stretch;

    @media (min-width: ${theme.breakpoints.md}) {
      align-self: flex-end;
      inline-size: 240px;
    }
  }
`,
);
