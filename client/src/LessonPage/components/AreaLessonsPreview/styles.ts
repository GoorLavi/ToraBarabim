import { css } from 'styled-components';

export const AreaLessonsPreview = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};

  > .heading {
    display: flex;

    > .headingLink {
      display: inline-flex;
      align-items: center;
      gap: ${theme.spacing.xs};
      min-block-size: 48px;
      color: ${theme.colors.primary};
      font-weight: ${theme.typography.sectionHeading.fontWeight};
      font-size: ${theme.typography.sectionHeading.phone.fontSize};
      line-height: ${theme.typography.sectionHeading.phone.lineHeight};
      text-decoration: none;

      @media (min-width: ${theme.breakpoints.md}) {
        font-size: ${theme.typography.sectionHeading.desktop.fontSize};
        line-height: ${theme.typography.sectionHeading.desktop.lineHeight};
      }

      @media (hover: hover) and (pointer: fine) {
        &:hover {
          color: ${theme.colors.primaryStrong};
          text-decoration: underline;
        }
      }

      &:active {
        color: ${theme.colors.primaryStrong};
      }

      &:focus-visible {
        outline: 2px solid ${theme.colors.primary};
        outline-offset: 2px;
        border-radius: ${theme.radii.sm};
      }

      > .chevron {
        inline-size: 20px;
        block-size: 20px;
        flex-shrink: 0;
      }
    }
  }

  /* Card count is a cap, not a hidden fourth child: whatever cellCount the
     server sends (today the AREA_PREVIEW_LIMIT is 4), the phone row shows at
     most 4 (two full rows of two) and the desktop row shows at most 3, so a
     limit other than 4 never wraps into an orphaned single-item second row
     once the grid steps to three columns at \`md\` (design-system.md, "The
     lesson grid steps"; LOCKED PLAN, "Card count"). Applies to both the
     skeleton and the loaded grid, so the section reserves identical space in
     both. */
  > .skeleton > .cell:nth-child(n + 5),
  > .grid > .cell:nth-child(n + 5) {
    display: none;
  }

  > .skeleton > .cell:nth-child(n + 4),
  > .grid > .cell:nth-child(n + 4) {
    @media (min-width: ${theme.breakpoints.md}) {
      display: none;
    }
  }
`,
);
