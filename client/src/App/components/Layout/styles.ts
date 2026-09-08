import { css } from 'styled-components';

// The one shell every public page shares: a column that reaches at least
// the viewport's block size, so a short page's footer still lands at the
// bottom instead of leaving dead background under it. `dvh`, not `%`: `%`
// resolves against `#root`, which only reaches the viewport by accident of
// how the document happens to flow.
export const Layout = css`
  display: flex;
  flex-direction: column;
  min-block-size: 100dvh;

  > .body {
    flex: 1 0 auto;
  }

  > .footer {
    flex-shrink: 0;
  }
`;
