import styled from 'styled-components';

import { LessonsGridSkeleton } from '~/components/LessonsGridSkeleton/LessonsGridSkeleton';

import { INITIAL_VISIBLE_COUNT } from '../DayLessons/consts';
import type { DayLessonsSkeletonProps } from './models';
import * as styles from './styles';

// `headingLabel` is derived purely from the chosen date and city
// (LessonsSection/helpers.ts, dayHeadingLabel), which are already known
// before the lesson list itself has loaded, so the heading renders as real
// text rather than a placeholder bar.
export const DayLessonsSkeleton = styled(({ className, headingLabel }: DayLessonsSkeletonProps) => (
  <section className={className} aria-hidden="true">
    <h2 className="title" dir="auto">{headingLabel}</h2>
    <LessonsGridSkeleton cellCount={INITIAL_VISIBLE_COUNT} />
  </section>
))`
  ${styles.DayLessonsSkeleton}
`;
