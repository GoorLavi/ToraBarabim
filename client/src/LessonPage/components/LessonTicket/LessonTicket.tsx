import type { Rabbi } from '@torabarabim/common';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { navigationClickProps } from '~/analytics/helpers';
import { trackEvent } from '~/analytics/mixpanel';
import { todayInIsrael } from '~/HomePage/helpers';
import { AUDIENCE_LABELS, SUBSTITUTE_PREFIX_BY_HONORIFIC } from '~/consts';
import { rabbiDisplayName, rabbiPath } from '~/helpers';
import * as pageConsts from '~/LessonPage/consts';
import { teachingRabbiOf } from '~/LessonPage/helpers';

import * as consts from './consts';
import {
  addressLine,
  computeDurationMinutes,
  dayNumberLabel,
  durationLabel,
  endTimeLabel,
  googleMapsHref,
  kickerLabel,
  monthLabel,
  roleLabel,
  wazeHref,
  weekdayLabel,
} from './helpers';
import type { LessonTicketProps } from './models';
import * as styles from './styles';

// Both brand marks are a flat list of `<path>`s, each with its own literal fill, so one
// renderer covers both icons.
const renderIconPath = ({ d, fill }: { d: string; fill: string }, index: number) => <path key={index} d={d} fill={fill} />;

// Shared by the original rabbi's link and the teaching rabbi's link below: a
// single name in the ticket, not a ranked list, so there is no real position
// to report.
const trackRabbiClick = (rabbi: Rabbi, displayName: string): void => {
  trackEvent(MIXPANEL_EVENTS.rabbiClick, {
    rabbiId: rabbi.id,
    rabbiName: displayName,
    surface: 'lessonPage',
    position: 0,
  });
};

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
  const wazeUrl = wazeHref(occurrence.place);
  const googleMapsUrl = googleMapsHref(occurrence.place);
  const showNavRow = !isCancelled && Boolean(wazeUrl) && Boolean(googleMapsUrl);
  const rabbiName = rabbiDisplayName(teachingRabbi);

  const handleNavigationClick = (provider: 'waze' | 'googleMaps'): void => {
    trackEvent(MIXPANEL_EVENTS.navigationClick, navigationClickProps(provider, occurrence, teachingRabbi, rabbiName, todayInIsrael()));
  };

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
          <div className="address">
            <p className="venue" dir="auto">
              {occurrence.place.name}
            </p>
            <p className="street" dir="auto">
              {addressLine(occurrence.place.street, occurrence.place.floor)}
            </p>
            <p className="city" dir="auto">
              {occurrence.place.city}
            </p>

            <span className="audienceTag" dir="auto">
              {AUDIENCE_LABELS[occurrence.audience]}
            </span>

            {showNavRow && wazeUrl && googleMapsUrl && (
              <div className="navRow">
                <p className="heading" dir="auto">
                  {consts.NAV_ROW_HEADING_LABEL}
                </p>

                <a
                  className="navButton waze"
                  href={wazeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={consts.WAZE_ARIA_LABEL}
                  onClick={() => handleNavigationClick('waze')}
                >
                  <svg className="icon waze" viewBox={consts.WAZE_ICON_VIEW_BOX} aria-hidden="true">
                    {consts.WAZE_ICON_PATHS.map(renderIconPath)}
                  </svg>
                  <span dir="ltr">{consts.WAZE_LABEL}</span>
                </a>

                <a
                  className="navButton googleMaps"
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={consts.GOOGLE_MAPS_ARIA_LABEL}
                  onClick={() => handleNavigationClick('googleMaps')}
                >
                  <svg className="icon googleMaps" viewBox={consts.GOOGLE_MAPS_ICON_VIEW_BOX} aria-hidden="true">
                    {consts.GOOGLE_MAPS_ICON_PATHS.map(renderIconPath)}
                  </svg>
                  <span dir="ltr">{consts.GOOGLE_MAPS_LABEL}</span>
                </a>
              </div>
            )}
          </div>

          <span className="hairline" aria-hidden="true" />

          <div className="teacherRow">
            <div className="teacher">
              <span className="role" dir="auto">
                {roleLabel(teachingRabbi.honorific)}
              </span>

              {isSubstitute && (
                <span className="substituteTag">
                  <span className="prefix">{SUBSTITUTE_PREFIX_BY_HONORIFIC[occurrence.rabbi.honorific]}</span>
                  <Link
                    className="originalRabbiLink"
                    to={rabbiPath(occurrence.rabbi)}
                    dir="auto"
                    onClick={() => trackRabbiClick(occurrence.rabbi, rabbiDisplayName(occurrence.rabbi))}
                  >
                    {rabbiDisplayName(occurrence.rabbi)}
                  </Link>
                </span>
              )}

              <h1 className="name">
                <Link className="nameLink" to={rabbiPath(teachingRabbi)} dir="auto" onClick={() => trackRabbiClick(teachingRabbi, rabbiName)}>
                  {rabbiName}
                </Link>
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
