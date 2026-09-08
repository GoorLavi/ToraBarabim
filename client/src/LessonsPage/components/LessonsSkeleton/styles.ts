import { css } from 'styled-components';

import { LessonsGrid } from '../LessonsGrid/styles';

// Gap between the two title bars: 10px sits between `sm` (8) and `md` (12)
// and matches neither (05-lessons.md, "Phone, loading").
const TITLE_BAR_GAP = '10px';

export const LessonsSkeleton = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};

  > .title {
    display: flex;
    flex-direction: column;
    gap: ${TITLE_BAR_GAP};

    > .titleBar {
      inline-size: 200px;
      block-size: 32px;
      border-radius: ${theme.radii.sm};
      background: ${theme.colors.border};
    }

    > .subtitleBar {
      inline-size: 160px;
      block-size: 20px;
      border-radius: ${theme.radii.sm};
      background: ${theme.colors.border};
    }
  }

  > .grid {
    ${LessonsGrid}
  }
`,
);
