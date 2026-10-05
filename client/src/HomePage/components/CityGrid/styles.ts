import { css } from 'styled-components';

export const CityGrid = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};

  > .heading {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: ${theme.spacing.md};

    > .titles {
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.xs};
      min-inline-size: 0;

      > h2 {
        font-size: ${theme.typography.sectionHeading.phone.fontSize};
        line-height: ${theme.typography.sectionHeading.phone.lineHeight};
        font-weight: ${theme.typography.sectionHeading.fontWeight};
        color: ${theme.colors.text};

        @media (min-width: ${theme.breakpoints.md}) {
          font-size: ${theme.typography.sectionHeading.desktop.fontSize};
          line-height: ${theme.typography.sectionHeading.desktop.lineHeight};
        }
      }

      > .subtitle {
        color: ${theme.colors.textSecondary};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
      }
    }

    > .seeAll {
      flex-shrink: 0;
    }
  }

  > .state {
    color: ${theme.colors.textSecondary};
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};
  }

  > .state.error {
    color: ${theme.colors.danger};
  }

  > .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: ${theme.spacing.md};

    @media (min-width: ${theme.breakpoints.md}) {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    > li {
      display: flex;
    }
  }
`,
);
