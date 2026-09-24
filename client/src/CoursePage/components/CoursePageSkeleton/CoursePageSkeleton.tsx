import styled from 'styled-components';

import type { CoursePageSkeletonProps } from './models';
import * as styles from './styles';

export const CoursePageSkeleton = styled(({ className }: CoursePageSkeletonProps) => (
  <div className={className} aria-hidden="true">
    <div className="gallery" />
    <div className="bar title" />
    <div className="bar wide" />
    <div className="bar wide" />
    <div className="bar narrow" />
  </div>
))`
  ${styles.CoursePageSkeleton}
`;
