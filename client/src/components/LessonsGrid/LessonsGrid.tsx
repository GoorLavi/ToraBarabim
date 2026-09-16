import styled from 'styled-components';

import { LessonCard } from '~/HomePage/components/LessonCard/LessonCard';

import type { LessonsGridProps } from './models';
import * as styles from './styles';

export const LessonsGrid = styled(({ className, items, surface }: LessonsGridProps) => (
  <ul className={className}>
    {items.map((lesson) => (
      <li className="cell" key={`${lesson.lessonId}-${lesson.date}`}>
        <LessonCard {...{ lesson, surface }} />
      </li>
    ))}
  </ul>
))`
  ${styles.LessonsGrid}
`;
