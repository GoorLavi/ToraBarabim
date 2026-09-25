import classNames from 'classnames';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { AUDIENCE_LABELS, MIDDLE_DOT_SEPARATOR } from '~/consts';
import { courseOpeningDateCompactLabel, courseOpeningDateLongLabel, coursePath } from '~/helpers';

import { courseAudienceTreatment, courseCardAriaLabel, courseStateSealParts, isClosedState, teacherLabel } from './helpers';
import type { CourseCardProps } from './models';
import * as styles from './styles';

// The lesson tile's own size and shape (design-system.md, "the lesson
// tile's exact size in every rail tier"; styles.ts): only the poster's
// corner mark and the body's text lines are course-specific.
export const CourseCard = styled(({ className, course, clickContext }: CourseCardProps) => {
  const handleClick = (): void => {
    trackEvent(MIXPANEL_EVENTS.courseClick, { courseId: course.id, courseName: course.name, ...clickContext });
  };

  const isClosed = isClosedState(course.state);
  const seal = courseStateSealParts(course.state);

  return (
    <Link to={coursePath(course)} aria-label={courseCardAriaLabel(course)} className={className} onClick={handleClick}>
      <div className="poster">
        <img className="image" src={course.coverUrl} alt="" />
        <div className={classNames('stateTag', { closed: isClosed })}>
          <span className="small">{seal.small}</span>
          {isClosed && <span className="rule" aria-hidden="true" />}
          <span className="big">{seal.big}</span>
        </div>
      </div>

      <div className="body">
        <h3 className="title" dir="auto">
          {course.name}
        </h3>

        <p className="teacher" dir="auto">
          {teacherLabel(course.teacher)}
        </p>

        <p className="opening" dir="auto">
          <span className="long">{courseOpeningDateLongLabel(course.openingDate)}</span>
          <span className="compact">{courseOpeningDateCompactLabel(course.openingDate)}</span>
        </p>

        <p className="meta" dir="auto">
          <span className={classNames('audience', courseAudienceTreatment(course))}>{AUDIENCE_LABELS[course.audience]}</span>
          {MIDDLE_DOT_SEPARATOR}
          {course.venue.city}
        </p>
      </div>
    </Link>
  );
})`
  ${styles.CourseCard}
`;
