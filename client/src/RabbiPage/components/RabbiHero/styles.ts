import { css } from 'styled-components';

import {
  NAME_BLOCK_GAP_DESKTOP,
  POSTER_HEIGHT_DESKTOP,
  POSTER_HEIGHT_PHONE,
  POSTER_WIDTH_DESKTOP,
  POSTER_WIDTH_PHONE,
} from './consts';

export const RabbiHero = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.xl};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.primary};

  @media (min-width: ${theme.breakpoints.lg}) {
    flex-direction: row;
    align-items: center;
    gap: ${theme.spacing.xxl};
    padding: ${theme.spacing.xxl};
    inline-size: 100%;
  }

  > .poster {
    inline-size: ${POSTER_WIDTH_PHONE};
    block-size: ${POSTER_HEIGHT_PHONE};
    border-radius: ${theme.radii.md};
    object-fit: cover;
    flex-shrink: 0;

    @media (min-width: ${theme.breakpoints.lg}) {
      inline-size: ${POSTER_WIDTH_DESKTOP};
      block-size: ${POSTER_HEIGHT_DESKTOP};
    }
  }

  > .names {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.xs};
    inline-size: 100%;
    min-inline-size: 0;

    @media (min-width: ${theme.breakpoints.lg}) {
      flex: 1 1 auto;
      gap: ${NAME_BLOCK_GAP_DESKTOP};
    }

    > .name {
      font-size: ${theme.typography.pageHeading.phone.fontSize};
      line-height: ${theme.typography.pageHeading.phone.lineHeight};
      font-weight: ${theme.typography.pageHeading.fontWeight};
      color: ${theme.colors.textOnPrimary};
      overflow-wrap: break-word;

      @media (min-width: ${theme.breakpoints.lg}) {
        font-size: ${theme.typography.pageHeading.desktop.fontSize};
        line-height: ${theme.typography.pageHeading.desktop.lineHeight};
      }
    }

    > .title {
      font-size: ${theme.typography.body.phone.fontSize};
      line-height: ${theme.typography.body.phone.lineHeight};
      font-weight: ${theme.typography.fontWeight.regular};
      color: ${theme.colors.textOnPrimaryMuted};
      overflow-wrap: break-word;

      @media (min-width: ${theme.breakpoints.lg}) {
        font-size: ${theme.typography.sectionHeading.desktop.fontSize};
        line-height: ${theme.typography.sectionHeading.desktop.lineHeight};
      }
    }

    > .meta {
      font-size: ${theme.typography.secondary.phone.fontSize};
      line-height: ${theme.typography.secondary.phone.lineHeight};
      font-weight: ${theme.typography.fontWeight.semiBold};
      color: ${theme.colors.accentOnDark};

      @media (min-width: ${theme.breakpoints.lg}) {
        font-size: ${theme.typography.body.phone.fontSize};
        line-height: ${theme.typography.body.phone.lineHeight};
      }
    }
  }
`,
);
