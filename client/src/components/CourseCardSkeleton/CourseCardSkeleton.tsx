import styled from 'styled-components';

import type { CourseCardSkeletonProps } from './models';
import * as styles from './styles';

// One card's worth of skeleton, shaped like the real CourseCard rather than
// a flat rectangle, mirroring LessonCardSkeleton's own reasoning.
export const CourseCardSkeleton = styled(({ className }: CourseCardSkeletonProps) => (
  <div className={className} aria-hidden="true">
    <div className="poster">
      <div className="stateTag" />
    </div>
    <div className="body">
      <div className="titleBar" />
      <div className="teacherBar" />
      <div className="openingBar" />
      <div className="metaBar" />
    </div>
  </div>
))`
  ${styles.CourseCardSkeleton}
`;
