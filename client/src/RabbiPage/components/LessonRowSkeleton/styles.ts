import { css } from 'styled-components';

export const LessonRowSkeleton = css(
  ({ theme }) => `
  block-size: 110px;
  border-radius: ${theme.radii.lg};
  background: ${theme.colors.border};
`,
);
