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

    /* A grid row's own block-size already stretches to its tallest cell;
       this makes the cell's own chip fill that cell rather than hugging its
       own content, so a wrapped city name's neighbour keeps a level bottom
       edge (design spec, "let the chip grow... the row's other chip
       stretches to match"). */
    > li {
      display: flex;
    }
  }
`,
);
