import { css } from 'styled-components';

import { contentBandCap, contentGutterInline } from '~/styles/contentBand';

export const FilterFieldsGrid = css(
  ({ theme }) => `
  ${contentGutterInline(theme)}
  ${contentBandCap(theme)}
  display: grid;
  align-items: center;
  gap: ${theme.spacing.md};
  grid-template-columns: auto minmax(0, 1fr);
  grid-template-areas: 'logo city' 'chips chips' 'search search';

  /* The human asked for this threshold directly: 480 (sm), not 768 (md),
     so the two-row layout starts as soon as there is real room for it. */
  @media (min-width: ${theme.breakpoints.sm}) {
    grid-template-columns: auto minmax(0, 1fr) auto;
    grid-template-areas: 'logo search search' 'chips chips city';
  }

  @media (min-width: ${theme.breakpoints.lg}) {
    grid-template-columns: auto auto minmax(0, 1fr) auto;
    grid-template-areas: 'logo chips search city';
    gap: ${theme.spacing.lg};
  }

  > .logo {
    grid-area: logo;
    justify-self: start;
    min-inline-size: 0;
  }

  > .chips {
    grid-area: chips;
    justify-self: start;
    min-inline-size: 0;
  }

  > .searchRow {
    grid-area: search;
    display: flex;
    align-items: center;
    /* Same gap as the date chips row (design review, frame 9:94). */
    gap: ${theme.spacing.md};
    min-inline-size: 0;

    > .search {
      flex: 1;
      min-inline-size: 0;
      block-size: 48px;
    }
  }

  > .city {
    grid-area: city;
    justify-self: end;
    min-inline-size: 0;
  }
`,
);
