import classNames from 'classnames';
import styled from 'styled-components';

import * as consts from './consts';
import { descriptionLabel } from './helpers';
import type { LessonCardProps } from './models';
import * as styles from './styles';

// The rabbi's portrait is structural, not decorative (design-system.md, "The
// poster image spec"): the card is built around an image being present. A
// missing photoUrl is real data today (Rabbi.photoUrl is optional on the
// wire), so it falls back to a single, plain, undecorated fill rather than
// initials or a silhouette, kept in this one spot for a later single edit.
export const LessonCard = styled(({ className, lesson }: LessonCardProps) => {
  const teachingRabbi = lesson.substituteRabbi ?? lesson.rabbi;
  const description = descriptionLabel(lesson);

  return (
    <article className={classNames(className, { cancelled: lesson.status === 'cancelled' })}>
      <div className="poster">
        {teachingRabbi.photoUrl ? (
          <img className="image" src={teachingRabbi.photoUrl} alt="" />
        ) : (
          <div className="image placeholder" aria-hidden="true" />
        )}
        <div className="medallion" dir="ltr">
          <span className="weekday">{consts.cardWeekday(lesson.date)}</span>
          <span className="time">{lesson.startTime}</span>
        </div>
      </div>

      <div className="body">
        <h3 className="title" dir="auto">
          {teachingRabbi.name}
        </h3>

        <p className="meta" dir="auto">
          <span className="audience">{consts.LESSON_AUDIENCE_LABELS[lesson.audience]}</span>
          {description && <span className="description"> · {description}</span>}
        </p>

        <p className="city" dir="auto">
          {lesson.place.city}
        </p>

        {lesson.status === 'cancelled' && (
          <p className="cancelledBadge" role="status">
            <span>{consts.CANCELLED_LABEL}</span>
            {lesson.cancellationReason && (
              <span className="reason" dir="auto">
                {lesson.cancellationReason}
              </span>
            )}
          </p>
        )}

        {lesson.substituteRabbi && (
          <p className="substituteNote" dir="auto">
            {consts.SUBSTITUTE_LABEL} {lesson.rabbi.name}
          </p>
        )}
      </div>
    </article>
  );
})`
  ${styles.LessonCard}
`;
