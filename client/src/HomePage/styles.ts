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
    /* Distinct from the rail-to-rail gap below (\`gap\`, still open per the
       human): this is the header-to-content band, which read as a dead
       stripe under the header on a phone before the poster grid even
       started (design review, item 5). */
    padding-block-start: ${theme.spacing.xxl};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.section};

    @media (min-width: ${theme.breakpoints.md}) {
      padding-inline: ${theme.spacing.xl};
      padding-block-start: ${theme.spacing.section};
    }

    > .browse {
      display: flex;
      flex-direction: column;
      gap: ${theme.spacing.lg};

      > .context {
        color: ${theme.colors.textSecondary};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
        text-align: start;
      }
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
