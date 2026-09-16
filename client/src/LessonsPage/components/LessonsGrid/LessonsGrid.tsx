import styled from 'styled-components';

import { LessonCard } from '~/HomePage/components/LessonCard/LessonCard';

import type { LessonsGridProps } from './models';
import * as styles from './styles';

export const LessonsGrid = styled(({ className, items, surface }: LessonsGridProps) => (
  <ul className={className}>
    {items.map((item, index) => (
      <li className="cell" key={`${item.lessonId}-${item.date}`}>
        <LessonCard {...{ lesson: item, clickContext: { surface, position: index } }} />
      </li>
    ))}
  </ul>
))`
  ${styles.LessonsGrid}
`;
