import { css } from 'styled-components';

// The catch-all route's own content: the same side gutter as every other
// screen, so a dead link still lands somewhere that looks like this site.
// NotFoundScreen supplies the card itself.
export const RouteNotFoundPage = css(
  ({ theme }) => `
  padding-inline: ${theme.spacing.lg};

  @media (min-width: ${theme.breakpoints.md}) {
    padding-inline: ${theme.spacing.xl};
  }
`,
);
