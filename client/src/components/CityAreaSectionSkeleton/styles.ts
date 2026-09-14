import { css } from 'styled-components';

// Static, no timer-driven motion (design-system.md, Feel), mirroring the
// real CityAreaSection's grid steps so the loading layout does not jump when
// the real chips replace it.
export const CityAreaSectionSkeleton = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};

  @media (min-width: ${theme.breakpoints.md}) {
    gap: ${theme.spacing.lg};
  }

  > .headingBar {
    inline-size: 140px;
    block-size: 28px;
    border-radius: ${theme.radii.sm};
    background: ${theme.colors.border};
  }

  > .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: ${theme.spacing.md};

    @media (min-width: ${theme.breakpoints.md}) {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: ${theme.spacing.lg};
    }

    @media (min-width: ${theme.breakpoints.xl}) {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    > .chipBar {
      block-size: 70px;
      border-radius: ${theme.radii.md};
      background: ${theme.colors.border};
    }
  }
`,
);
