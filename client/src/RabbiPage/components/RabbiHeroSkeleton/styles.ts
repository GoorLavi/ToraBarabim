import { css } from 'styled-components';

import {
  META_BAR_HEIGHT,
  META_BAR_WIDTH,
  NAME_BAR_HEIGHT,
  NAME_BAR_WIDTH,
  POSTER_HEIGHT_DESKTOP,
  POSTER_HEIGHT_PHONE,
  POSTER_WIDTH_DESKTOP,
  POSTER_WIDTH_PHONE,
  TITLE_BAR_HEIGHT,
  TITLE_BAR_WIDTH,
} from './consts';

export const RabbiHeroSkeleton = css(
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
  }

  > .poster {
    inline-size: ${POSTER_WIDTH_PHONE};
    block-size: ${POSTER_HEIGHT_PHONE};
    border-radius: ${theme.radii.md};
    background: ${theme.colors.surfaceOnPrimary};
    flex-shrink: 0;

    @media (min-width: ${theme.breakpoints.lg}) {
      inline-size: ${POSTER_WIDTH_DESKTOP};
      block-size: ${POSTER_HEIGHT_DESKTOP};
    }
  }

  > .names {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};

    > .bar {
      border-radius: ${theme.radii.sm};
      background: ${theme.colors.surfaceOnPrimary};
    }

    > .bar.name {
      inline-size: ${NAME_BAR_WIDTH};
      block-size: ${NAME_BAR_HEIGHT};
    }

    > .bar.title {
      inline-size: ${TITLE_BAR_WIDTH};
      block-size: ${TITLE_BAR_HEIGHT};
    }

    > .bar.meta {
      inline-size: ${META_BAR_WIDTH};
      block-size: ${META_BAR_HEIGHT};
    }
  }
`,
);
