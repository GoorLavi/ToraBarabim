import { css } from 'styled-components';

export const CityPage = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  min-block-size: 100%;

  > .content {
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

      > .areaLink {
        display: inline-flex;
        align-items: center;
        gap: ${theme.spacing.sm};
        min-block-size: 48px;
        padding-inline-start: ${theme.spacing.sm};
        color: ${theme.colors.primary};
        font-weight: ${theme.typography.fontWeight.semiBold};
        font-size: ${theme.typography.secondary.phone.fontSize};
        line-height: ${theme.typography.secondary.phone.lineHeight};
        text-decoration: none;

        @media (hover: hover) and (pointer: fine) {
          &:hover {
            color: ${theme.colors.primaryStrong};
            text-decoration: underline;
          }
        }

        &:active {
          color: ${theme.colors.primaryStrong};
        }

        &:focus-visible {
          outline: 2px solid ${theme.colors.primary};
          outline-offset: 2px;
          border-radius: ${theme.radii.sm};
        }

        > .chevron {
          inline-size: 12px;
          block-size: 12px;
          flex-shrink: 0;
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
  }
`,
);
