import { css } from 'styled-components';

// 10px matches neither spacing step, measured off the loading frame
// (design spec, "Title: bars 240x32 and 180x20, gap 10").
const TITLE_BAR_GAP = '10px';

export const TitleSkeleton = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${TITLE_BAR_GAP};

  > .bar {
    border-radius: ${theme.radii.sm};
    background: ${theme.colors.border};
  }

  > .bar.heading {
    inline-size: 240px;
    max-inline-size: 100%;
    block-size: 32px;
  }

  > .bar.sub {
    inline-size: 180px;
    max-inline-size: 100%;
    block-size: 20px;
  }
`,
);
