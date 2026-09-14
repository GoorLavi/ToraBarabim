import { css } from 'styled-components';

// The last row of a wrapping grid aligns to the inline start and leaves the
// empty cell at the inline end: ordinary grid behaviour, accepted (design
// spec, "City chip").
export const CityAreaSection = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};

  @media (min-width: ${theme.breakpoints.md}) {
    gap: ${theme.spacing.lg};
  }

  > .heading {
    /* The anchor reaches 48px through its own min-block-size, never
       through the heading's line box (design-system.md, "A target is not
       as tall as its text"): the systemic defect the design system names
       is exactly a section-head link left at its text's own height. */
    > .headingLink {
      display: inline-flex;
      align-items: center;
      gap: ${theme.spacing.sm};
      min-block-size: 48px;
      padding-block: ${theme.spacing.sm};
      color: ${theme.colors.text};
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
          color: ${theme.colors.primary};
          text-decoration: underline;
        }
      }

      &:active {
        color: ${theme.colors.primary};
      }

      &:focus-visible {
        outline: 2px solid ${theme.colors.primary};
        outline-offset: 2px;
        border-radius: ${theme.radii.sm};
      }

      > .chevron {
        inline-size: 16px;
        block-size: 16px;
        flex-shrink: 0;
      }
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
`,
);
