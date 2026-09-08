import { css } from 'styled-components';

// 20px does not match any spacing token (design-system.md: the scale is
// 4/8/12/16/24/32/48/64).
const DESKTOP_PADDING_BLOCK_END = '20px';

// Full-bleed primary band, independent of the page's centred content column
// (mirrors HomePage/components/Header/styles.ts): zero top padding so the
// plum field runs from the very top of the page with no seam
// (05-lessons.md, "The filter band").
export const FilterBand = css(
  ({ theme }) => `
  background: ${theme.colors.primary};
  padding-block-end: ${theme.spacing.lg};

  @media (min-width: ${theme.breakpoints.md}) {
    padding-block-end: ${DESKTOP_PADDING_BLOCK_END};
  }

  > .bar {
    /* The band caps at theme.layout.contentMaxWidth (1280) and centres from
       1328px up: a 1280px band plus the 24px gutter on both sides is 1328px,
       so that is the container's own max width, not 1280
       (design-system.md, "Breakpoints and content width"). */
    max-inline-size: calc(${theme.layout.contentMaxWidth} + ${theme.spacing.xl} * 2);
    margin-inline: auto;
    padding-inline: ${theme.spacing.lg};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};

    @media (min-width: ${theme.breakpoints.md}) {
      padding-inline: ${theme.spacing.xl};
    }

    > .cityRow {
      display: flex;
      justify-content: flex-end;
    }

    > .searchRow > .search {
      inline-size: 100%;

      @media (min-width: ${theme.breakpoints.md}) {
        inline-size: 480px;
      }
    }
  }
`,
);
