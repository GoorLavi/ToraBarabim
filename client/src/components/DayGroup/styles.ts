import { css } from 'styled-components';

export const DayGroup = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};

  > .heading {
    font-size: ${theme.typography.sectionHeading.phone.fontSize};
    line-height: ${theme.typography.sectionHeading.phone.lineHeight};
    font-weight: ${theme.typography.sectionHeading.fontWeight};
    color: ${theme.colors.text};

    @media (min-width: ${theme.breakpoints.md}) {
      font-size: ${theme.typography.sectionHeading.desktop.fontSize};
      line-height: ${theme.typography.sectionHeading.desktop.lineHeight};
    }
  }

  > .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: ${theme.spacing.md};

    @media (min-width: ${theme.breakpoints.md}) {
      grid-template-columns: repeat(3, 1fr);
      gap: ${theme.spacing.lg};
    }

    @media (min-width: ${theme.breakpoints.xl}) {
      grid-template-columns: repeat(4, 1fr);
    }

    /* Stretches each cell's single child to the row's shared height, so a
       neighbour whose third line wraps does not leave the row ragged
       (design spec, "Stretch behaviour"). */
    > .cell {
      display: grid;
    }
  }
`,
);
