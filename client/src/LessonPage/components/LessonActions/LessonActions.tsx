import { useState } from 'react';
import styled from 'styled-components';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { QuietButton } from '~/components/QuietButton/QuietButton';
import { ShareButton } from '~/components/ShareButton/ShareButton';

import { lessonActionsOf, lessonShareText, lessonShareUrl, occurrenceWhenLabel } from '../../helpers';
import { CalendarSheet } from './components/CalendarSheet/CalendarSheet';
import * as consts from './consts';
import { addOneEventLink, calendarPlatformOf, subscribeToLessonLink } from './helpers';
import type { CalendarLink, LessonActionsProps } from './models';
import * as styles from './styles';

const openCalendarLink = (link: CalendarLink): void => {
  if (link.opensInNewTab) {
    window.open(link.href, '_blank', 'noopener,noreferrer');
    return;
  }
  window.location.assign(link.href);
};

// The row below the ticket. Which of the two actions shows is derived from
// the occurrence on every render: the calendar needs a date to add, and the
// share needs a pattern or a date to send.
export const LessonActions = styled(({ className, occurrence }: LessonActionsProps) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { calendarOccurrence } = occurrence;
  const { canShare, canAddToCalendar } = lessonActionsOf(occurrence);

  if (!canShare && !canAddToCalendar) return null;

  const addOneEvent = (): void => {
    if (!calendarOccurrence) return;
    const link = addOneEventLink(calendarOccurrence, calendarPlatformOf(navigator.userAgent));
    trackEvent(MIXPANEL_EVENTS.calendarAddClick, { kind: 'static', target: link.target });
    setIsSheetOpen(false);
    openCalendarLink(link);
  };

  const subscribe = (): void => {
    const link = subscribeToLessonLink(occurrence.lessonId, calendarPlatformOf(navigator.userAgent));
    trackEvent(MIXPANEL_EVENTS.calendarAddClick, { kind: 'subscribe', target: link.target });
    setIsSheetOpen(false);
    openCalendarLink(link);
  };

  // A one-time lesson has only the one choice; a weekly one asks which.
  const handleCalendarClick = (): void => {
    if (occurrence.schedule.kind === 'once') {
      addOneEvent();
      return;
    }
    setIsSheetOpen(true);
  };

  return (
    <div className={className}>
      {canShare && <ShareButton {...{ className: 'share', text: lessonShareText(occurrence), url: lessonShareUrl(occurrence), tone: 'light', surface: 'lessonPage' }} />}

      {canAddToCalendar && (
        <QuietButton
          {...{
            className: 'calendar',
            icon: (
              <svg className="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d={consts.CALENDAR_ICON_PATH} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ),
            label: consts.ADD_TO_CALENDAR_LABEL,
            onClick: handleCalendarClick,
          }}
        />
      )}

      {isSheetOpen && calendarOccurrence && (
        <CalendarSheet {...{ dateLabel: occurrenceWhenLabel(calendarOccurrence), onAddOneEvent: addOneEvent, onSubscribe: subscribe, onDismiss: () => setIsSheetOpen(false) }} />
      )}
    </div>
  );
})`
  ${styles.LessonActions}
`;
