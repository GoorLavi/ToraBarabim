import styled from 'styled-components';

import { LessonCard } from '~/HomePage/components/LessonCard/LessonCard';

import type { LessonsGridProps } from './models';
import * as styles from './styles';

export const LessonsGrid = styled(({ className, items, surface, clickSurface }: LessonsGridProps) => (
  <ul className={className}>
    {items.map((lesson, index) => (
      <li className="cell" key={`${lesson.lessonId}-${lesson.date}`}>
        <LessonCard {...{ lesson, surface, clickContext: { surface: clickSurface, position: index } }} />
      </li>
    ))}
  </ul>
))`
  ${styles.LessonsGrid}
`;
