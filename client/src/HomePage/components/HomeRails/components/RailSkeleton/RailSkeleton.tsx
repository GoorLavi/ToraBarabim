import styled from 'styled-components';

import { LessonCardSkeleton } from '~/HomePage/components/LessonCardSkeleton/LessonCardSkeleton';

import * as consts from './consts';
import type { RailSkeletonProps } from './models';
import * as styles from './styles';

export const RailSkeleton = styled(({ className }: RailSkeletonProps) => (
  <div className={className}>
    <div className="headingBar" />
    <div className="cards">
      {consts.CARD_KEYS.map((key) => (
        <LessonCardSkeleton key={key} className="card" />
      ))}
    </div>
  </div>
))`
  ${styles.RailSkeleton}
`;
