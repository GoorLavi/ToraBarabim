import { css } from 'styled-components';

// The fixed contact bar belongs to the course page the route renders, in a
// different part of the tree from this portalled card, so the card finds it
// from the document root: the bar marks itself with a data attribute
// (ContactBar.tsx) and both read one height from the theme. The bar is only
// shown below lg, so the card returns to its ordinary corner from lg up.
export const InstallPrompt = css(
  ({ theme }) => `
  :root:has([data-fixed-bottom-bar]) &.nonModal {
    inset-block-end: ${theme.layout.fixedBottomBarBlockSize};

    @media (min-width: ${theme.breakpoints.md}) {
      inset-block-end: calc(${theme.layout.fixedBottomBarBlockSize} + ${theme.spacing.lg});
    }

    @media (min-width: ${theme.breakpoints.lg}) {
      inset-block-end: ${theme.spacing.xl};
    }
  }
`,
);
