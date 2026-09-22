import { css } from 'styled-components';

// `:not(:first-child)` rather than a border owned by the parent grid, so the
// parent never has to compute which child starts a new visual row. That
// alone guarantees a hairline above every field but the first in source
// order, which is wrong the moment a caller's grid places a second field
// beside the first instead of below it: every view page's `fieldsGrid` goes
// two columns at `md`, so a second field that is not `.wide` lands in the
// same top visual row as the first, at the card's top inner edge, with
// nothing above it (design gate finding F3, on PlaceViewPage's city and
// street). The rule below cancels the hairline there and only there: both
// this field and the one right before it have to be non-`.wide` and that
// one has to be the first field, or the removal would also strike a field
// that a `.wide` sibling pushed down into row two (RabbiViewPage's bio,
// LessonViewPage's rabbi block), which still needs its line.
export const RecordField = css(
  ({ theme }) => `
  display: flex;
  align-items: baseline;
  gap: ${theme.spacing.sm};
  padding-block: ${theme.spacing.sm};

  &:not(:first-child) {
    border-block-start: 1px solid ${theme.colors.border};
  }

  @media (min-width: ${theme.breakpoints.md}) {
    :first-child:not(.wide) + &:not(.wide) {
      border-block-start: none;
    }
  }

  &.wide {
    grid-column: 1 / -1;
  }

  > .label {
    /* Grows past 84 rather than wrapping: the longest label on these pages
       ('קומה או הוראות הגעה') overruns 84px at this size, and a fixed basis
       would wrap it onto a second and third line, making that one row two or
       three times its neighbours' height on the narrowest screen. */
    flex: 0 1 auto;
    min-inline-size: 84px;
    color: ${theme.colors.textSecondary};
    font-size: ${theme.typography.secondary.phone.fontSize};
    line-height: ${theme.typography.secondary.phone.lineHeight};
  }

  > .value {
    flex: 1;
    min-inline-size: 0;
    overflow-wrap: break-word;
    color: ${theme.colors.text};
    font-weight: ${theme.typography.fontWeight.regular};
    font-size: ${theme.typography.body.phone.fontSize};
    line-height: ${theme.typography.body.phone.lineHeight};
  }

  &.empty > .value {
    color: ${theme.colors.textSecondary};
  }
`,
);
