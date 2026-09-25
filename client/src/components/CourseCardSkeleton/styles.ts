import { css } from 'styled-components';

import { CARD_WIDE_THRESHOLD } from '~/consts';
import { POSTER_ASPECT_RATIO } from '~/HomePage/consts';

// Mirrors LessonCardSkeleton exactly (same box, same static-not-pulsing
// rule), shaped for CourseCard's own four text lines (title, teacher,
// opening date, audience and city) instead of three.
export const CourseCardSkeleton = css(
  ({ theme }) => `
  container-type: inline-size;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.surface};

  > .poster {
    position: relative;
    aspect-ratio: ${POSTER_ASPECT_RATIO};
    background: ${theme.colors.primarySoft};

    > .stateTag {
      position: absolute;
      inset-block-start: ${theme.spacing.sm};
      inset-inline-end: ${theme.spacing.sm};
      inline-size: 64px;
      block-size: 22px;
      border-radius: ${theme.radii.sm};
      background: ${theme.colors.border};
    }
  }

  > .body {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: ${theme.spacing.xs};
    padding: ${theme.spacing.md};
    block-size: calc(
      2 * ${theme.spacing.md} + ${theme.typography.cardTitleCompact.phone.lineHeight} + 3 * ${theme.spacing.xs} + 3 *
        ${theme.typography.secondaryCompact.phone.lineHeight}
    );

    @container (min-inline-size: ${CARD_WIDE_THRESHOLD}) {
      block-size: calc(
        2 * ${theme.spacing.md} + ${theme.typography.cardTitle.phone.lineHeight} + 3 * ${theme.spacing.xs} + 3 *
          ${theme.typography.secondary.phone.lineHeight}
      );
    }

    > .titleBar,
    > .teacherBar,
    > .openingBar,
    > .metaBar {
      block-size: 14px;
      border-radius: ${theme.radii.sm};
      background: ${theme.colors.primarySoft};
    }

    > .titleBar {
      inline-size: 80%;
      block-size: 18px;
    }

    > .teacherBar {
      inline-size: 55%;
    }

    > .openingBar {
      inline-size: 65%;
    }

    > .metaBar {
      inline-size: 45%;
    }
  }
`,
);
