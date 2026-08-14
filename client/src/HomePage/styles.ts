import { css } from 'styled-components';

export const HomePage = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  min-block-size: 100%;

  > .content {
    max-inline-size: 1120px;
    inline-size: 100%;
    margin-inline: auto;
    padding-inline: ${theme.spacing.lg};
    padding-block-start: ${theme.spacing.section};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.section};

    @media (min-width: ${theme.breakpoints.md}) {
      padding-inline: ${theme.spacing.xl};
    }
  }

  > .footer {
    max-inline-size: 1120px;
    inline-size: 100%;
    margin-inline: auto;
    padding-inline: ${theme.spacing.lg};

    @media (min-width: ${theme.breakpoints.md}) {
      padding-inline: ${theme.spacing.xl};
    }
  }
`,
);
