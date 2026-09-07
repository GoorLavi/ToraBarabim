import styled from 'styled-components';

import type { LessonDetailsSkeletonProps } from './models';
import * as styles from './styles';

// Stands in for `LessonDetails` while the occurrence is loading: three
// static bars, never known to be bio or note or both until the data arrives
// (design spec, "Loading").
export const LessonDetailsSkeleton = styled(({ className }: LessonDetailsSkeletonProps) => (
  <div className={className} aria-hidden="true">
    <span className="bar wide" />
    <span className="bar" />
    <span className="bar narrow" />
  </div>
))`
  ${styles.LessonDetailsSkeleton}
`;
