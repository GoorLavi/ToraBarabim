import { css } from 'styled-components';

import { LessonsGrid } from '../LessonsGrid/styles';

export const LessonsGridSkeleton = css<{ maxColumns?: number }>`
  ${LessonsGrid}
`;
