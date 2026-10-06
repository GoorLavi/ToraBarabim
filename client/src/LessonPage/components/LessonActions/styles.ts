import { css } from 'styled-components';

import { RUNNING_TEXT_MAX_INLINE_SIZE } from '../../consts';

// Equal halves while both labels fit on one line, a stack the moment one no
// longer does: each button never shrinks below its own label, and the row
// wraps on that, never on a breakpoint. From md the buttons hug their labels.
//
// The share button's root dissolves (display: contents), so its two buttons
// stay put while the copy-failed line and field, which belong to it, become
// row items of their own: they drop under both buttons at the row's full
// width, and never count toward the share button's own minimum width.
export const LessonActions = css(
  ({ theme }) => `
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: ${theme.spacing.sm};

  > .share {
    display: contents;
  }

  > .share > .button,
  > .calendar {
    flex: 1 1 0;
    min-inline-size: max-content;
    padding-inline: ${theme.spacing.md};

    @media (min-width: ${theme.breakpoints.md}) {
      flex: 0 0 auto;
      padding-inline: ${theme.spacing.xl};
    }
  }

  > .share > .notice,
  > .share > .fallback {
    order: 1;
    flex: 0 0 100%;
    min-inline-size: 0;
  }

  > .share > .fallback {
    max-inline-size: ${RUNNING_TEXT_MAX_INLINE_SIZE};
  }

  > .calendar > .icon {
    flex: 0 0 auto;
    block-size: 20px;
    inline-size: 20px;
  }
`,
);
