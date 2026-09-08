import { css } from 'styled-components';

import type { Theme } from '~/theme/models';

// The site's one content band, split into two pieces because a single
// border-box element cannot both take padding for its gutter and cap at a
// fixed max-width without the padding eating into that cap (design spec,
// "the exact geometry"). Shared by this page's own `.content` and
// `.footer`, by Footer's own root element, and by Header/styles.ts's
// `<header>` and `.bar`. Plain strings, not `css` blocks, because this
// codebase's styles.ts pattern builds one CSS string per component rather
// than composing real styled-components `css` fragments, so a shared piece
// has to be a function stitched into that string.
//
// `contentGutterInline` goes on the full-width, unconstrained outer
// element: the padding that carries the page's inline margin while the
// viewport is still narrower than `contentMaxWidth + 2 * xl` (1280 + 24 +
// 24 = 1328). At and above that width the padding drops to zero, so the
// extra space becomes an outer margin around the capped band
// (`contentBandCap`, applied to the inner element) instead of more padding.
export const contentGutterInline = (theme: Theme): string => `
  padding-inline: ${theme.spacing.lg};

  @media (min-width: ${theme.breakpoints.md}) {
    padding-inline: ${theme.spacing.xl};
  }

  @media (min-width: calc(${theme.layout.contentMaxWidth} + 2 * ${theme.spacing.xl})) {
    padding-inline: 0;
  }
`;

// The band itself: capped at the site's one content width and centred
// inside whatever gutter its own parent applies via `contentGutterInline`.
export const contentBandCap = (theme: Theme): string => `
  max-inline-size: ${theme.layout.contentMaxWidth};
  inline-size: 100%;
  margin-inline: auto;
`;

export const HomePage = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  min-block-size: 100%;

  > .content {
    ${contentGutterInline(theme)}
    /* Distinct from the rail-to-rail gap below (\`gap\`, still open per the
       human): this is the header-to-content band, which read as a dead
       stripe under the header on a phone before the poster grid even
       started (design review, item 5). */
    padding-block-start: ${theme.spacing.xxl};

    @media (min-width: ${theme.breakpoints.md}) {
      padding-block-start: ${theme.spacing.section};
    }

    > .band {
      ${contentBandCap(theme)}
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
  }

  > .footer {
    ${contentGutterInline(theme)}
  }
`,
);
