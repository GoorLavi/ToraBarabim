import { css } from 'styled-components';

import { RUNNING_TEXT_MAX_INLINE_SIZE } from '~/LessonPage/consts';

export const LessonDetailsSkeleton = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  max-inline-size: ${RUNNING_TEXT_MAX_INLINE_SIZE};

  > .bar {
    display: block;
    inline-size: 40%;
    block-size: 20px;
    border-radius: ${theme.radii.sm};
    background: ${theme.colors.border};

    &.wide {
      inline-size: 60%;
    }

    &.narrow {
      inline-size: 25%;
    }
  }
`,
);
