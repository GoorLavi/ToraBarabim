import { css } from 'styled-components';

import { AREA_BLOCK_GAP, TITLE_GAP } from './consts';

// Off the 4px spacing scale, the gap between the two skeleton title bars
// (design spec, "Phone, loading").
const TITLE_SKELETON_GAP = '10px';

export const CitiesPage = css(
  ({ theme }) => `
  /* The band caps at theme.layout.contentMaxWidth (1280) and centres from
     1328px up: a 1280px band plus the 24px gutter on both sides is 1328px,
     so that is the container's own max width, not 1280
     (design-system.md, "Breakpoints and content width"). */
  max-inline-size: calc(${theme.layout.contentMaxWidth} + ${theme.spacing.xl} * 2);
  inline-size: 100%;
  margin-inline: auto;
  padding-inline: ${theme.spacing.lg};
  padding-block-start: ${theme.spacing.xl};
  padding-block-end: ${theme.spacing.xxl};
  display: flex;
  flex-direction: column;
  gap: ${AREA_BLOCK_GAP};

  @media (min-width: ${theme.breakpoints.md}) {
    padding-inline: ${theme.spacing.xl};
    padding-block-end: ${theme.spacing.xxxl};
  }

  @media (min-width: ${theme.breakpoints.xl}) {
    gap: ${theme.spacing.xxl};
  }

  > .titleBlock {
    display: flex;
    flex-direction: column;

    > .heading {
      color: ${theme.colors.text};
      font-weight: ${theme.typography.pageHeading.fontWeight};
      font-size: ${theme.typography.pageHeading.phone.fontSize};
      line-height: ${theme.typography.pageHeading.phone.lineHeight};

      @media (min-width: ${theme.breakpoints.md}) {
        font-size: ${theme.typography.pageHeading.desktop.fontSize};
        line-height: ${theme.typography.pageHeading.desktop.lineHeight};
      }
    }

    > .sub {
      margin-block-start: ${TITLE_GAP};
      color: ${theme.colors.textSecondary};
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};

      @media (min-width: ${theme.breakpoints.md}) {
        font-size: ${theme.typography.body.desktop.fontSize};
        line-height: ${theme.typography.body.desktop.lineHeight};
      }
    }

    > .headingBar {
      inline-size: 160px;
      block-size: 32px;
    }

    > .subBar {
      inline-size: 200px;
      block-size: 20px;
      margin-block-start: ${TITLE_SKELETON_GAP};
    }

    > .headingBar,
    > .subBar {
      border-radius: ${theme.radii.sm};
      background: ${theme.colors.border};
    }
  }
`,
);
