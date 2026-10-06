import { css } from 'styled-components';

// The one shell every public page shares: a column that reaches at least
// the viewport's block size, so a short page's footer still lands at the
// bottom instead of leaving dead background under it. `dvh`, not `%`: `%`
// resolves against `#root`, which only reaches the viewport by accident of
// how the document happens to flow. Its own background is load-bearing: in
// the installed app the canvas behind it is plum (GlobalStyle), so without
// it a long page would turn plum below the first screen.
export const Layout = css`
  display: flex;
  flex-direction: column;
  min-block-size: 100dvh;
  background: ${({ theme }) => theme.colors.bg};

  > .body {
    flex: 1 0 auto;
  }

  > .footer {
    flex-shrink: 0;
  }
`;
