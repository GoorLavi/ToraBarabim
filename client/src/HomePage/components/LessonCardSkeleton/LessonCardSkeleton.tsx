import styled from 'styled-components';

import type { LessonCardSkeletonProps } from './models';
import * as styles from './styles';

// One card's worth of skeleton, shaped like the real LessonCard (a poster
// with a medallion corner, then title, meta and city bars) rather than flat
// rectangles, so a still block still reads as "a lesson card is coming"
// outdoors (design review: "static only works when the skeleton is shaped
// like the thing that is coming"). Shared by RailSkeleton and
// DayLessonsSkeleton, the two places that lay several of these out.
export const LessonCardSkeleton = styled(({ className }: LessonCardSkeletonProps) => (
  <div className={className} aria-hidden="true">
    <div className="poster">
      <div className="medallion" />
    </div>
    <div className="body">
      <div className="titleBar" />
      <div className="metaBar" />
      <div className="cityBar" />
    </div>
  </div>
))`
  ${styles.LessonCardSkeleton}
`;
