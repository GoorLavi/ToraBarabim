import classNames from 'classnames';
import styled from 'styled-components';

import { LESSON_AUDIENCE_LABELS } from '~/HomePage/components/LessonCard/consts';
import * as pageConsts from '~/LessonPage/consts';
import { teachingRabbiOf } from '~/LessonPage/helpers';

import {
  addressLine,
  computeDurationMinutes,
  dayNumberLabel,
  durationLabel,
  endTimeLabel,
  kickerLabel,
  monthLabel,
  roleLabel,
  weekdayLabel,
} from './helpers';
import type { LessonTicketProps } from './models';
import * as styles from './styles';

// The loading state is this same shell with nothing inside it
// (`LessonTicketSkeleton`), so every shape rule lives in `TicketShell` and
// this file only ever adds text and images, never layout.
export const LessonTicket = styled(({ className, occurrence }: LessonTicketProps) => {
  const isCancelled = occurrence.status === 'cancelled';
  const isSubstitute = Boolean(occurrence.substituteRabbi);
  const teachingRabbi = teachingRabbiOf(occurrence);
  const isNoPoster = !teachingRabbi.photoUrl;
  const kicker = kickerLabel(occurrence);
  const duration = computeDurationMinutes(occurrence.startTime, occurrence.endTime);

  return (
    <div className={classNames(className, { cancelled: isCancelled, noPoster: isNoPoster })}>
      {isCancelled && (
        <p className="cancelledBanner" role="status">
          <span className="heading" dir="auto">
            {pageConsts.CANCELLED_HEADING_LABEL}
          </span>
          <span className="reason" dir="auto">
            {occurrence.cancellationReason ?? pageConsts.NO_REASON_GIVEN_LABEL}
          </span>
        </p>
      )}

      <div className="ticketRow">
        <div className="stub">
          <span className="notch start" aria-hidden="true" />
          <span className="notch end" aria-hidden="true" />

          {kicker && (
            <p className="kicker" dir="auto">
              {kicker}
            </p>
          )}

          <div className="whenRow">
            <div className="dateCol">
              <span className="weekday" dir="auto">
                {weekdayLabel(occurrence.date)}
              </span>
              <span className="day" dir="ltr">
                {dayNumberLabel(occurrence.date)}
              </span>
              <span className="month" dir="auto">
                {monthLabel(occurrence.date)}
              </span>
            </div>

            <span className="hairline" aria-hidden="true" />

            <div className="timeCol">
              <span className="time" dir="ltr">
                {occurrence.startTime}
              </span>
              <span className="endTime" dir="auto">
                {endTimeLabel(occurrence.endTime)}
              </span>
              <span className="duration" dir="auto">
                {durationLabel(duration)}
              </span>
            </div>
          </div>
        </div>

        <div className={classNames('body', { noPoster: isNoPoster })}>
          <div className="place">
            <p className="venue" dir="auto">
              {occurrence.place.name}
            </p>
            <p className="address" dir="auto">
              {addressLine(occurrence.place.street, occurrence.place.floor)}
            </p>
            <p className="city" dir="auto">
              {occurrence.place.city}
            </p>

            <span className="audienceTag" dir="auto">
              {LESSON_AUDIENCE_LABELS[occurrence.audience]}
            </span>
          </div>

          <span className="hairline" aria-hidden="true" />

          <div className="teacherRow">
            <div className="teacher">
              <span className="role" dir="auto">
                {roleLabel(isSubstitute)}
              </span>

              {isSubstitute && (
                <span className="substituteTag" dir="auto">
                  {pageConsts.originalRabbiTagLabel(occurrence.rabbi.name)}
                </span>
              )}

              <h1 className="name" dir="auto">
                {teachingRabbi.name}
              </h1>

              {teachingRabbi.title && (
                <p className="title" dir="auto">
                  {teachingRabbi.title}
                </p>
              )}
            </div>

            {teachingRabbi.photoUrl && <img className="poster" src={teachingRabbi.photoUrl} alt="" />}
          </div>
        </div>
      </div>
    </div>
  );
})`
  ${styles.TicketShell}
`;
