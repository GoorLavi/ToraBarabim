import type { Theme } from '~/theme/models';

// The site's one content band, split into two pieces because a single
// border-box element cannot both take padding for its gutter and cap at a
// fixed max-width without the padding eating into that cap (design spec,
// "the exact geometry"). Plain strings, not `css` blocks, because this
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
