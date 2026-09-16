import styled from 'styled-components';

import { LessonCardSkeleton } from '~/HomePage/components/LessonCardSkeleton/LessonCardSkeleton';

import { skeletonCardKeys } from './consts';
import type { LessonsGridSkeletonProps } from './models';
import * as styles from './styles';

export const LessonsGridSkeleton = styled(({ className, cellCount }: LessonsGridSkeletonProps) => (
  <ul className={className}>
    {skeletonCardKeys(cellCount).map((key) => (
      <li className="cell" key={key}>
        <LessonCardSkeleton />
      </li>
    ))}
  </ul>
))`
  ${styles.LessonsGridSkeleton}
`;
