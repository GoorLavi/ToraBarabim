import { css } from 'styled-components';

export const HomePage = css(
  ({ theme }) => `
  /* A constant gutter, not the shared contentGutterInline/contentBandCap
     pair (~/styles/contentBand.ts): those two drop the outer padding to
     zero once the viewport passes the site's old content cap, on the
     assumption the inner band's own max-inline-size and auto margin take
     over the centring at that point. This page's band is deliberately
     uncapped (owner, 2026-09-22: more cards on a wide screen, not bigger
     ones, and the same for the page around them), so there is no inner
     cap to hand off to, and the gutter has to stay constant instead of
     collapsing to nothing. */
  padding-inline: ${theme.spacing.lg};

  @media (min-width: ${theme.breakpoints.md}) {
    padding-inline: ${theme.spacing.xl};
  }

  /* Distinct from the rail-to-rail gap below (\`gap\`, still open per the
     human): this is the header-to-content band, which read as a dead
     stripe under the header on a phone before the poster grid even
     started (design review, item 5). */
  padding-block-start: ${theme.spacing.xxl};

  > .band {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.section};

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
`,
);
