import classNames from 'classnames';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { AUDIENCE_LABELS } from '~/consts';
import { lessonPath, rabbiDisplayName } from '~/helpers';

import * as consts from './consts';
import { audienceTreatment, cardAriaLabel, descriptionLabel } from './helpers';
import type { LessonCardProps } from './models';
import * as styles from './styles';

// The rabbi's portrait is structural, not decorative (design-system.md, "The
// poster image spec"): the card is built around an image being present. A
// missing photoUrl is real data today (Rabbi.photoUrl is optional on the
// wire), so it falls back to a single, plain, undecorated fill rather than
// initials or a silhouette, kept in this one spot for a later single edit.
export const LessonCard = styled(({ className, lesson, surface }: LessonCardProps) => {
  const teachingRabbi = lesson.substituteRabbi ?? lesson.rabbi;
  const description = descriptionLabel(lesson);
  const treatment = audienceTreatment(lesson.audience, surface);

  return (
    <Link
      to={lessonPath(lesson)}
      aria-label={cardAriaLabel(lesson)}
      className={classNames(className, { cancelled: lesson.status === 'cancelled' })}
      onClick={() => trackEvent(MIXPANEL_EVENTS.lessonClick, { lessonId: lesson.lessonId })}
    >
      <div className="poster">
        {teachingRabbi.photoUrl ? (
          <img className="image" src={teachingRabbi.photoUrl} alt="" />
        ) : (
          <div className="image placeholder" aria-hidden="true" />
        )}
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
          {lesson.place.city}
        </p>

        {lesson.substituteRabbi && (
          <p className="substituteNote" dir="auto">
            {consts.SUBSTITUTE_LABEL} {rabbiDisplayName(lesson.rabbi)}
          </p>
        )}
      </div>
    </Link>
  );
})`
  ${styles.LessonCard}
`;
