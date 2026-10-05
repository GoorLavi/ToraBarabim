import styled from 'styled-components';

import { RailHeading } from '~/components/RailHeading/RailHeading';
import { LessonCardSkeleton } from '~/HomePage/components/LessonCardSkeleton/LessonCardSkeleton';

import * as consts from './consts';
import type { RailSkeletonProps } from './models';
import * as styles from './styles';

export const RailSkeleton = styled(({ className, heading }: RailSkeletonProps) => (
  <div className={className}>
    {heading ? <RailHeading {...heading} /> : <div className="headingBar" />}
    <div className="cards">
      {consts.CARD_KEYS.map((key) => (
        <LessonCardSkeleton key={key} className="card" />
      ))}
    </div>
  </div>
))`
  ${styles.RailSkeleton}
`;
