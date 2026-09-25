import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { cycleLabel } from '~/CoursePage/consts';
import { AUDIENCE_LABELS, COURSE_STATE_TAG_CLOSED, COURSE_STATE_TAG_FULL, COURSE_STATE_TAG_OPEN, MIDDLE_DOT_SEPARATOR } from '~/consts';
import { courseClosedLineLabel, courseOpeningDateLongLabel, formatCourseScope, joinWithMiddleDot, venuePanelCityName } from '~/helpers';
import { RABBI_ROUTES } from '~/RabbiPanel/consts';

import * as consts from './consts';
import type { CourseListItemProps } from './models';
import * as styles from './styles';

export const CourseListItem = styled(({ className, course }: CourseListItemProps) => {
  const isClosed = course.lifecycle.status === 'closed';

  return (
    <li className={className}>
      <span className="title" dir="auto">
        {course.name}
        {course.cycle !== undefined && (
          <span className="cycle">
            {MIDDLE_DOT_SEPARATOR}
            {cycleLabel(course.cycle)}
          </span>
        )}
      </span>

      {course.lifecycle.status === 'closed' ? (
        <>
          {/* The tag stays beside its own line, never on a separate one:
              the line wraps its own text instead if the two together do
              not fit the card's width (design gate round 2 finding). */}
          <div className="closedRow">
            <span className="tag">{course.lifecycle.reason === 'full' ? COURSE_STATE_TAG_FULL : COURSE_STATE_TAG_CLOSED}</span>
            <span className="closedLine">{courseClosedLineLabel(course.lifecycle)}</span>
          </div>
          <div className="tags">
            <span className="tag">{AUDIENCE_LABELS[course.audience]}</span>
            <span className="tag" dir="auto">
              {venuePanelCityName(course.venue)}
            </span>
          </div>
        </>
      ) : (
        <>
          <span className="when" dir="auto">
            {joinWithMiddleDot([courseOpeningDateLongLabel(course.openingDate), formatCourseScope(course.weeks, course.sessions, undefined)])}
          </span>
          <div className="tags">
            <span className="tag open">{COURSE_STATE_TAG_OPEN}</span>
            <span className="tag">{AUDIENCE_LABELS[course.audience]}</span>
            <span className="tag" dir="auto">
              {venuePanelCityName(course.venue)}
            </span>
          </div>
        </>
      )}

      <Link className="action" to={RABBI_ROUTES.courseEdit(course.id)}>
        {isClosed ? consts.DETAIL_LABEL : consts.EDIT_LABEL}
      </Link>
    </li>
  );
})`
  ${styles.CourseListItem}
`;
