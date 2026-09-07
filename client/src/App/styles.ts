import { css } from 'styled-components';

// The catch-all route's own page: the same header chrome and side gutter as
// every other screen, so a dead link still lands somewhere that looks like
// this site (design spec, "Error and not found"). `NotFoundScreen` supplies
// the card itself; this only wraps it with the chrome and the gutter it was
// missing.
export const RouteNotFoundPage = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  min-block-size: 100%;

  > .content {
    padding-inline: ${theme.spacing.lg};

    @media (min-width: ${theme.breakpoints.md}) {
      padding-inline: ${theme.spacing.xl};
    }
  }
`,
);
