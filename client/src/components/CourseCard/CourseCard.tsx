import classNames from 'classnames';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { CourseStateSeal } from '~/components/CourseStateSeal/CourseStateSeal';
import { AUDIENCE_LABELS, COURSE_CARD_META_SEPARATOR } from '~/consts';
import { courseOpeningDateCompactLabel, courseOpeningDateLongLabel, coursePath } from '~/helpers';

import { courseAudienceTreatment, courseCardAriaLabel, courseStateSealParts, isClosedState, teacherLabel } from './helpers';
import type { CourseCardProps } from './models';
import * as styles from './styles';

// The lesson tile's own size and shape (design-system.md, "the lesson
// tile's exact size in every rail tier"; styles.ts): only the poster's
// corner mark and the body's text lines are course-specific.
export const CourseCard = styled(({ className, course, surface, clickContext }: CourseCardProps) => {
  const handleClick = (): void => {
    trackEvent(MIXPANEL_EVENTS.courseClick, { courseId: course.id, courseName: course.name, ...clickContext });
  };

  const isClosed = isClosedState(course.state);
  const seal = courseStateSealParts(course.state);

  return (
    <Link to={coursePath(course)} aria-label={courseCardAriaLabel(course)} className={className} onClick={handleClick}>
      <div className="poster">
        <img className="image" src={course.coverUrl} alt="" />
        <CourseStateSeal {...{ small: seal.small, big: seal.big, isClosed }} />
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
          <span className={classNames('audience', courseAudienceTreatment(course, surface))}>{AUDIENCE_LABELS[course.audience]}</span>
          {COURSE_CARD_META_SEPARATOR}
          {course.venue.city}
        </p>
      </div>
    </Link>
  );
})`
  ${styles.CourseCard}
`;
