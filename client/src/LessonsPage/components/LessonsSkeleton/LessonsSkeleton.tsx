import styled from 'styled-components';

import { LessonsGridSkeleton } from '~/components/LessonsGridSkeleton/LessonsGridSkeleton';

import { SKELETON_CARD_COUNT } from './consts';
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
    <LessonsGridSkeleton {...{ cellCount: SKELETON_CARD_COUNT }} />
  </div>
))`
  ${styles.LessonsSkeleton}
`;
