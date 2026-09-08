import { createGlobalStyle } from 'styled-components';

// The one sanctioned global reset (root CLAUDE.md, Styling): every other
// stylesheet in this app targets a class name, never a bare element.
export const GlobalStyle = createGlobalStyle(
  ({ theme }) => `
  *, *::before, *::after {
    box-sizing: border-box;
  }

  html, body, #root {
    height: 100%;
  }

  html {
    /* 64 matches PinnedHeaderBar's own height below lg, 80 matches the
       sticky header's height at lg and up, so a focused field or an
       anchor never lands under either bar. */
    scroll-padding-block-start: 64px;

    @media (min-width: ${theme.breakpoints.lg}) {
      scroll-padding-block-start: 80px;
    }
  }

  body {
    margin: 0;
    background: ${theme.colors.bg};
    color: ${theme.colors.text};
    font-family: ${theme.typography.fontFamily};
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};
    -webkit-font-smoothing: antialiased;
  }

  h1, h2, h3, h4, h5, h6, p, ul, ol {
    margin: 0;
    padding: 0;
  }

  ul, ol {
    list-style: none;
  }

  button, input, select, textarea {
    font: inherit;
    color: inherit;
  }

  button {
    background: none;
    border: none;
    cursor: pointer;
  }

  img {
    max-width: 100%;
    display: block;
  }
`,
);
