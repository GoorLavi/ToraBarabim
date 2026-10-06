import classNames from 'classnames';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { lessonPath } from '~/helpers';

import { CANCELLED_TAG_LABEL, rowDateLabel } from './consts';
import { rowTitle, rowVenueLine } from './helpers';
import type { LessonRowProps } from './models';
import * as styles from './styles';

// A row, not a poster card: nine cards carrying the same photograph read as
// a wall (design spec, "The rabbi's schedule is rows, not poster cards").
export const LessonRow = styled(({ className, lesson }: LessonRowProps) => {
  const title = rowTitle(lesson);

  return (
    <Link to={lessonPath(lesson)} className={className}>
      <div className="when">
        <span className={classNames('time', { cancelledTime: lesson.status === 'cancelled' })}>{lesson.startTime}</span>
        <div className="dateGroup">
          <span className="date" dir="auto">
            {rowDateLabel(lesson.date)}
          </span>
          {lesson.status === 'cancelled' && <span className="cancelledTag">{CANCELLED_TAG_LABEL}</span>}
        </div>
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
