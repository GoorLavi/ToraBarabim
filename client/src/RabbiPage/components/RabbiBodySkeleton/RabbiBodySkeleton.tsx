import styled from 'styled-components';

import { LessonRowSkeleton } from '../LessonRowSkeleton/LessonRowSkeleton';
import type { RabbiBodySkeletonProps } from './models';
import * as styles from './styles';

// Stands in for the bio and the lessons heading while the rabbi's own
// record (call 1) is still loading, before the page knows whether to show
// the row list or the empty-state block (design spec, "Phone, loading").
// LessonsSection carries its own, later skeleton for the narrower window
// where call 1 has resolved but call 2 has not: that one shows the real
// "השיעורים" heading, already known by then, instead of this bar.
export const RabbiBodySkeleton = styled(({ className }: RabbiBodySkeletonProps) => (
  <div className={className} aria-hidden="true">
    <div className="bio">
      <div className="bar wide" />
      <div className="bar wide" />
      <div className="bar narrow" />
    </div>
    <div className="list">
      <div className="bar heading" />
      <LessonRowSkeleton />
      <LessonRowSkeleton />
      <LessonRowSkeleton />
    </div>
  </div>
))`
  ${styles.RabbiBodySkeleton}
`;
