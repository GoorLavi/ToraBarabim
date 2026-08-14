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

  button {
    font: inherit;
    color: inherit;
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
