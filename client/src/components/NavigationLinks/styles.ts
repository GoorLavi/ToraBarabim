import { css } from 'styled-components';

// Only the icon's own intrinsic sizing (source-SVG-derived, the same on
// every field this sits on): the button shape, its colors and the row's
// own layout stay each caller's own (LessonTicket's on-primary ticket
// field, CourseFacts' plain surface field), since those genuinely differ
// per field and neither is generic.
export const NavigationLinks = css(
  () => `
  > .navButton > .icon {
    flex: 0 0 auto;
    block-size: 20px;
    inline-size: auto;

    &.waze {
      aspect-ratio: 1 / 1;
    }

    &.googleMaps {
      aspect-ratio: 256 / 367;
    }
  }
`,
);
