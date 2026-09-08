import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { rowDateLabel } from './consts';
import { rowTitle, rowVenueLine } from './helpers';
import type { LessonRowProps } from './models';
import * as styles from './styles';

// A row, not a poster card: nine cards carrying the same photograph read as
// a wall (design spec, "The rabbi's schedule is rows, not poster cards").
export const LessonRow = styled(({ className, lesson }: LessonRowProps) => {
  const title = rowTitle(lesson);

  return (
    <Link to={`/lesson/${lesson.lessonId}/${lesson.date}`} className={className}>
      <div className="when">
        <span className="time">{lesson.startTime}</span>
        <span className="date" dir="auto">
          {rowDateLabel(lesson.date)}
        </span>
      </div>

      {title && (
        <p className="title" dir="auto">
          {title}
        </p>
      )}

      <p className="venue" dir="auto">
        {rowVenueLine(lesson)}
      </p>
    </Link>
  );
})`
  ${styles.LessonRow}
`;
