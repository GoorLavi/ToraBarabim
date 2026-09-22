import { css } from 'styled-components';

export const PlacePage = css(
  ({ theme }) => `
  /* The band caps at theme.layout.contentMaxWidth (1280) and centres from
     1328px up: a 1280px band plus the 24px gutter on both sides is 1328px,
     so that is the container's own max width, not 1280
     (design-system.md, "Breakpoints and content width"). */
  max-inline-size: calc(${theme.layout.contentMaxWidth} + ${theme.spacing.xl} * 2);
  inline-size: 100%;
  margin-inline: auto;
  padding-inline: ${theme.spacing.lg};
  padding-block: ${theme.spacing.lg} ${theme.spacing.xxl};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};

  @media (min-width: ${theme.breakpoints.md}) {
    padding-inline: ${theme.spacing.xl};
    padding-block: ${theme.spacing.xl} ${theme.spacing.xxxl};
    gap: ${theme.spacing.xxl};
  }

  > .loadMore {
    align-self: stretch;

    @media (min-width: ${theme.breakpoints.lg}) {
      align-self: flex-end;
      inline-size: 240px;
    }
  }
`,
);
