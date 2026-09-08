import { css } from 'styled-components';

// 10px matches neither spacing step (8 or 12): measured off the loading
// frame's bio block (design spec, "Bio: three bars 18 tall, gap 10").
const BIO_BAR_GAP = '10px';

export const RabbiBodySkeleton = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};

  > .bio {
    display: flex;
    flex-direction: column;
    gap: ${BIO_BAR_GAP};

    > .bar {
      block-size: 18px;
      border-radius: ${theme.radii.sm};
      background: ${theme.colors.border};
    }

    > .bar.wide {
      inline-size: 100%;
    }

    > .bar.narrow {
      inline-size: 200px;
      max-inline-size: 100%;
    }
  }

  > .list {
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.sm};

    > .bar.heading {
      inline-size: 130px;
      block-size: 28px;
      border-radius: ${theme.radii.sm};
      background: ${theme.colors.border};
    }
  }
`,
);
