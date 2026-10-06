import { css } from 'styled-components';

// The fixed contact bar belongs to the course page the route renders, in a
// different part of the tree from this portalled card, so the card finds it
// from the document root: the bar marks itself with a data attribute
// (ContactBar.tsx) and both read one height from the theme. The offset is a
// margin on top of whatever inset the sheet already gives the card, so the
// sheet's own placement is not repeated here. The bar is only shown below lg.
export const InstallPrompt = css(
  ({ theme }) => `
  :root:has([data-fixed-bottom-bar]) &.auto {
    margin-block-end: ${theme.layout.fixedBottomBarBlockSize};

    @media (min-width: ${theme.breakpoints.lg}) {
      margin-block-end: 0;
    }
  }
`,
);
