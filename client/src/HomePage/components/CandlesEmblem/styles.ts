import { css } from 'styled-components';

// Both variants set only `color` (the strokes read it via `currentColor`)
// and the flame fill, so no raw hex ever appears here: every value is a
// token read through the variant.
export const CandlesEmblem = css(
  ({ theme }) => `
  flex-shrink: 0;

  > .flame {
    stroke: none;
  }

  &.onPlum {
    color: ${theme.colors.textOnPrimary};

    > .flame {
      fill: ${theme.colors.accentOnDark};
    }
  }

  &.onSoft {
    color: ${theme.colors.primary};

    > .flame {
      fill: ${theme.colors.accent};
    }
  }
`,
);
