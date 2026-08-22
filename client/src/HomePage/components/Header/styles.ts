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

    @media (min-width: ${theme.breakpoints.md}) {
      padding-inline: ${theme.spacing.xl};
      grid-template-areas: 'logo chips search city';
      grid-template-columns: auto auto 1fr auto;
    }

    > .logo {
      grid-area: logo;
      display: flex;
      align-items: center;
      gap: ${theme.spacing.sm};
    }

    > .logo > .wordmark {
      color: ${theme.colors.textOnPrimary};
      font-weight: ${theme.typography.fontWeight.bold};
      font-size: ${theme.typography.sectionHeading.phone.fontSize};
      line-height: ${theme.typography.sectionHeading.phone.lineHeight};
    }

    > .chips {
      grid-area: chips;
    }

    > .search {
      grid-area: search;
    }

    > .city {
      grid-area: city;
      justify-self: end;

      @media (min-width: ${theme.breakpoints.md}) {
        justify-self: auto;
      }
    }
  }
`,
);
