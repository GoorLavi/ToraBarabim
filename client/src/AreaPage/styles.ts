import { css } from 'styled-components';

export const AreaPage = css(
  ({ theme }) => `
  /* The band caps at theme.layout.contentMaxWidth (1280) and centres from
     1328px up: a 1280px band plus the 24px gutter on both sides is 1328px,
     so that is the container's own max width, not 1280
     (design-system.md, "Breakpoints and content width"). Verbatim from
     CityPage/styles.ts: the same shell, a sibling page. */
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

  > .title {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: ${theme.spacing.xs};

    > .heading {
      font-size: ${theme.typography.pageHeading.phone.fontSize};
      line-height: ${theme.typography.pageHeading.phone.lineHeight};
      font-weight: ${theme.typography.pageHeading.fontWeight};
      color: ${theme.colors.text};
      overflow-wrap: break-word;

      @media (min-width: ${theme.breakpoints.md}) {
        font-size: ${theme.typography.pageHeading.desktop.fontSize};
        line-height: ${theme.typography.pageHeading.desktop.lineHeight};
      }
    }

    > .sub {
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
      color: ${theme.colors.textSecondary};

      @media (min-width: ${theme.breakpoints.md}) {
        font-size: ${theme.typography.body.phone.fontSize};
        line-height: ${theme.typography.body.phone.lineHeight};
      }
    }
  }

  > .citiesSection {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.md};

    @media (min-width: ${theme.breakpoints.md}) {
      gap: ${theme.spacing.lg};
    }

    > .heading {
      color: ${theme.colors.text};
      font-weight: ${theme.typography.sectionHeading.fontWeight};
      font-size: ${theme.typography.sectionHeading.phone.fontSize};
      line-height: ${theme.typography.sectionHeading.phone.lineHeight};

      @media (min-width: ${theme.breakpoints.md}) {
        font-size: ${theme.typography.sectionHeading.desktop.fontSize};
        line-height: ${theme.typography.sectionHeading.desktop.lineHeight};
      }
    }

    > .grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: ${theme.spacing.md};
      align-items: stretch;

      @media (min-width: ${theme.breakpoints.md}) {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: ${theme.spacing.lg};
      }

      @media (min-width: ${theme.breakpoints.xl}) {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }

      > .cell {
        display: block;
      }
    }
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
