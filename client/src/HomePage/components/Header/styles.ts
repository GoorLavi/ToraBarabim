import { css } from 'styled-components';

// Full-bleed primary band: the header owns its own background edge to edge,
// independent of the page's centred, max-width content column.
export const Header = css(
  ({ theme }) => `
  background: ${theme.colors.primary};
  padding-block: ${theme.spacing.lg};

  > .bar {
    max-inline-size: 1120px;
    margin-inline: auto;
    padding-inline: ${theme.spacing.lg};
    display: grid;
    grid-template-areas:
      'logo city'
      'chips chips'
      'search search';
    grid-template-columns: auto auto;
    align-items: center;
    gap: ${theme.spacing.md};

    /* A real two-row layout from \`md\` to just under \`lg\`: a single row
       still does not fit there (the logo, every date chip, the search field
       and the city picker side by side needs \`lg\`), but stacking
       everything into one narrow column, like the phone does, left a wide
       search field under a row of chips with hundreds of pixels of empty
       plum in between (design review). Two full-width bands instead: the
       wordmark and the search field share row one, the date chips and the
       city pill share row two. */
    @media (min-width: ${theme.breakpoints.md}) {
      padding-inline: ${theme.spacing.xl};
      grid-template-areas:
        'row1'
        'row2';
      grid-template-columns: 1fr;
    }

    /* Back to a single row at \`lg\`: the logo, chips, search and city each
       keep their own named area again, side by side. */
    @media (min-width: ${theme.breakpoints.lg}) {
      grid-template-areas: 'logo chips search city';
      grid-template-columns: auto auto 1fr auto;
    }

    > .row1 {
      /* On the phone and from \`lg\` up this wrapper drops out of the box
         tree, so its children (the logo, the search field) sit directly in
         \`.bar\`'s grid, each keeping its own named area below, exactly as
         if there were no wrapper here at all. Only the md-to-lg band turns
         it into a real row of its own. */
      display: contents;

      @media (min-width: ${theme.breakpoints.md}) {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${theme.spacing.md};
        grid-area: row1;
      }

      @media (min-width: ${theme.breakpoints.lg}) {
        display: contents;
      }

      > .logo {
        grid-area: logo;
        justify-self: start;
        display: flex;
        align-items: center;
        gap: ${theme.spacing.sm};
        min-block-size: 48px;
        border-radius: ${theme.radii.sm};
        color: ${theme.colors.textOnPrimary};
        text-decoration: none;

        &:hover,
        &:active {
          opacity: 0.9;
        }

        &:focus-visible {
          outline: 2px solid ${theme.colors.textOnPrimary};
          outline-offset: 2px;
        }

        > .wordmark {
          font-weight: ${theme.typography.fontWeight.bold};
          font-size: ${theme.typography.sectionHeading.phone.fontSize};
          line-height: ${theme.typography.sectionHeading.phone.lineHeight};
        }
      }

      > .search {
        grid-area: search;

        @media (min-width: ${theme.breakpoints.md}) {
          flex: 1;
          min-inline-size: 0;
        }
      }
    }

    > .row2 {
      display: contents;

      @media (min-width: ${theme.breakpoints.md}) {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: ${theme.spacing.md};
        grid-area: row2;
      }

      @media (min-width: ${theme.breakpoints.lg}) {
        display: contents;
      }

      > .chips {
        grid-area: chips;
      }

      > .city {
        grid-area: city;
        justify-self: end;

        @media (min-width: ${theme.breakpoints.lg}) {
          justify-self: auto;
        }
      }
    }
  }
`,
);
