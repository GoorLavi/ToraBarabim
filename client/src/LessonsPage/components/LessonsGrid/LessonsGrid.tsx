import styled from 'styled-components';

import { LessonCard } from '~/HomePage/components/LessonCard/LessonCard';

import type { LessonsGridProps } from './models';
import * as styles from './styles';

export const LessonsGrid = styled(({ className, items }: LessonsGridProps) => (
  <ul className={className}>
    {items.map((item) => (
      <li className="cell" key={`${item.lessonId}-${item.date}`}>
        <LessonCard lesson={item} />
      </li>
    ))}
  </ul>
))`
  ${styles.LessonsGrid}
`;
