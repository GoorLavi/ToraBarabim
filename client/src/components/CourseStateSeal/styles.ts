import { css } from 'styled-components';

// Absolutely positioned against a `position: relative` poster (`CourseCard`'s
// and `CoursePreviewCard`'s own `.poster`), so a caller needs nothing beyond
// that to place this in its own top corner.
export const CourseStateSeal = css(
  ({ theme }) => `
  position: absolute;
  inset-block-start: ${theme.spacing.sm};
  inset-inline-end: ${theme.spacing.sm};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-block: ${theme.spacing.xs};
  padding-inline: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.accentOnDark};
  border-radius: ${theme.radii.sm};
  background: ${theme.colors.primary};
  color: ${theme.colors.textOnPrimary};

  > .small {
    font-weight: ${theme.typography.fontWeight.regular};
    font-size: ${theme.typography.tagAndCaption.phone.fontSize};
    line-height: ${theme.typography.tagAndCaption.phone.lineHeight};
  }

  /* The same role the lesson card's own time badge uses for its big word
     (HomePage/components/LessonCard/styles.ts, ".time"), not the small
     word's tagAndCaption role at bold (design gate round 2 finding). */
  > .big {
    font-weight: ${theme.typography.timeInCard.fontWeight};
    font-size: ${theme.typography.timeInCard.phone.fontSize};
    line-height: ${theme.typography.timeInCard.phone.lineHeight};
  }

  /* The two closed reasons get a gold rule between the two words, so a
     closed course reads as a real, designed state rather than a plain tag
     (spec section 7, "designed as a real state... beautiful"). */
  &.closed > .rule {
    inline-size: 100%;
    block-size: 1px;
    margin-block: 2px;
    background: ${theme.colors.accentOnDark};
  }
`,
);
