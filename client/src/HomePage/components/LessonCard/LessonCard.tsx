import classNames from 'classnames';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { lessonClickProps } from '~/analytics/helpers';
import { trackEvent } from '~/analytics/mixpanel';
import { useActiveFilters } from '~/analytics/useActiveFilters';
import { todayInIsrael } from '~/HomePage/helpers';
import { AUDIENCE_LABELS, SUBSTITUTE_PREFIX_BY_HONORIFIC } from '~/consts';
import { lessonPath, rabbiDisplayName } from '~/helpers';

import * as consts from './consts';
import { audienceTreatment, cardAriaLabel, descriptionLabel, fallbackPosterFor } from './helpers';
import type { LessonCardProps } from './models';
import * as styles from './styles';

// The poster is keyed to the lesson id rather than the rabbi id so that a
// server render and the browser always land on the same image; a rabbi's
// lessons therefore differ from each other, which is intended.
export const LessonCard = styled(({ className, lesson, surface, clickContext }: LessonCardProps) => {
  const teachingRabbi = lesson.substituteRabbi ?? lesson.rabbi;
  const description = descriptionLabel(lesson);
  const treatment = audienceTreatment(lesson.audience, surface);
  const activeFilters = useActiveFilters();

  const handleClick = (): void => {
    const rabbiName = rabbiDisplayName(teachingRabbi);
    trackEvent(
      MIXPANEL_EVENTS.lessonClick,
      lessonClickProps(lesson, teachingRabbi, rabbiName, clickContext, activeFilters, todayInIsrael()),
    );
  };

  return (
    <Link
      to={lessonPath(lesson)}
      aria-label={cardAriaLabel(lesson)}
      className={classNames(className, { cancelled: lesson.status === 'cancelled' })}
      onClick={handleClick}
    >
      <div className="poster">
        <img className="image" src={teachingRabbi.photoUrl ?? fallbackPosterFor(lesson.lessonId)} alt="" />
        {lesson.status === 'cancelled' && (
          <span className="cancelledLabel" role="status">
            {consts.CANCELLED_LABEL}
          </span>
        )}
        <div className="medallion">
          <span className="weekday">{consts.cardWeekday(lesson.date)}</span>
          <span className="time" dir="ltr">
            {lesson.startTime}
          </span>
        </div>
      </div>

      <div className="body">
        <h3 className="title" dir="auto">
          {rabbiDisplayName(teachingRabbi)}
        </h3>

        <p className="meta" dir="auto">
          <span className={classNames('audience', treatment)}>{AUDIENCE_LABELS[lesson.audience]}</span>
          {description && <span className="description">{consts.META_SEPARATOR}{description}</span>}
        </p>

        <p className="city" dir="auto">
          {lesson.venue.city}
        </p>

        {lesson.substituteRabbi && (
          <p className="substituteNote" dir="auto">
            {consts.SUBSTITUTE_LABEL} {SUBSTITUTE_PREFIX_BY_HONORIFIC[lesson.rabbi.honorific]}{' '}
            <span dir="auto">{rabbiDisplayName(lesson.rabbi)}</span>
          </p>
        )}
      </div>
    </Link>
  );
})`
  ${styles.LessonCard}
`;
