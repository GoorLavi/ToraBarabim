import styled from 'styled-components';

import { LessonCardSkeleton } from '~/HomePage/components/LessonCardSkeleton/LessonCardSkeleton';

import * as consts from './consts';
import type { DayGroupSkeletonProps } from './models';
import * as styles from './styles';

// The heading is a generic bar, unlike LessonsSection's own skeleton
// (RabbiPage/components/LessonsSection): the day grouping itself comes
// from the same call this skeleton is standing in for, so there is no real
// heading text known yet to render instead (design spec, "Phone, loading").
export const DayGroupSkeleton = styled(({ className }: DayGroupSkeletonProps) => (
  <div className={className} aria-hidden="true">
    <div className="bar heading" />
    <div className="grid">
      {consts.CARD_KEYS.map((key) => (
        <LessonCardSkeleton key={key} />
      ))}
    </div>
  </div>
))`
  ${styles.DayGroupSkeleton}
`;
