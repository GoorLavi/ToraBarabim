import styled from 'styled-components';

import { LessonsGridSkeleton } from '~/components/LessonsGridSkeleton/LessonsGridSkeleton';

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
    <LessonsGridSkeleton {...{ cellCount: consts.CELL_COUNT }} />
  </div>
))`
  ${styles.DayGroupSkeleton}
`;
