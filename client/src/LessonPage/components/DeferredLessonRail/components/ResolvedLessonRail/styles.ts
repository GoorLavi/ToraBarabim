import { css } from 'styled-components';

// Only the empty state is a section of its own (a heading over a card); a
// populated rail's layout is Rail's.
export const ResolvedLessonRail = css(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`,
);
