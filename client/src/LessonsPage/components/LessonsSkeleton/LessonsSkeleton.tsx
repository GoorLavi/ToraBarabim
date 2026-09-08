import styled from 'styled-components';

import { LessonCardSkeleton } from '~/HomePage/components/LessonCardSkeleton/LessonCardSkeleton';

import { SKELETON_CARD_KEYS } from './consts';
import type { LessonsSkeletonProps } from './models';
import * as styles from './styles';

// Static, not a pulse (design-system.md, Feel: "no heavy animation";
// 00-shared-shell.md, "Skeletons": "a single slow opacity pulse, or
// nothing at all"). Every block keeps the loaded state's block size so
// nothing jumps once data lands.
export const LessonsSkeleton = styled(({ className }: LessonsSkeletonProps) => (
  <div className={className} aria-hidden="true">
    <div className="title">
      <div className="titleBar" />
      <div className="subtitleBar" />
    </div>
    <ul className="grid">
      {SKELETON_CARD_KEYS.map((key) => (
        <li className="cell" key={key}>
          <LessonCardSkeleton />
        </li>
      ))}
    </ul>
  </div>
))`
  ${styles.LessonsSkeleton}
`;
