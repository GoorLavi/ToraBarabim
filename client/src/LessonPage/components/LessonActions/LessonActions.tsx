import { useState } from 'react';
import styled from 'styled-components';

import { MIXPANEL_EVENTS } from '~/analytics/consts';
import { trackEvent } from '~/analytics/mixpanel';
import { QuietButton } from '~/components/QuietButton/QuietButton';
import { ShareButton } from '~/components/ShareButton/ShareButton';

import { lessonActionsOf, lessonShareText, lessonShareUrl, occurrenceWhenLabel } from '../../helpers';
import { CalendarSheet } from './components/CalendarSheet/CalendarSheet';
import * as consts from './consts';
import { calendarLinkOf, calendarPlatformOf, effectiveCalendarOf, opensInNewTab } from './helpers';
import type { CalendarChoice, CalendarLink, CalendarSheetState, LessonActionsProps } from './models';
import * as styles from './styles';

const openCalendarLink = (link: CalendarLink): void => {
  if (opensInNewTab(link)) {
    window.open(link.href, '_blank', 'noopener,noreferrer');
    return;
  }
  window.location.assign(link.href);
};

// The row below the ticket. Which of the two actions shows is derived from
// the occurrence on every render: the calendar needs a date to add, and the
// share needs a pattern or a date to send.
export const LessonActions = styled(({ className, occurrence }: LessonActionsProps) => {
  const [sheet, setSheet] = useState<CalendarSheetState>({ step: 'closed' });
  const { calendarOccurrence } = occurrence;
  const { canShare, canAddToCalendar } = lessonActionsOf(occurrence);

  if (!canShare && !canAddToCalendar) return null;

  const closeSheet = (): void => setSheet({ step: 'closed' });

  const addOneEvent = (calendar: CalendarChoice): void => {
    if (!calendarOccurrence) return;
    const platform = calendarPlatformOf(navigator.userAgent);
    const link = calendarLinkOf({ calendar, platform, scope: 'one', occurrence: calendarOccurrence });
    trackEvent(MIXPANEL_EVENTS.calendarAddClick, { kind: 'static', calendar: effectiveCalendarOf(calendar, platform), target: link.target });
    closeSheet();
    openCalendarLink(link);
  };

  const subscribe = (calendar: CalendarChoice): void => {
    const platform = calendarPlatformOf(navigator.userAgent);
    const link = calendarLinkOf({ calendar, platform, scope: 'all', lessonId: occurrence.lessonId });
    trackEvent(MIXPANEL_EVENTS.calendarAddClick, { kind: 'subscribe', calendar: effectiveCalendarOf(calendar, platform), target: link.target });
    closeSheet();
    openCalendarLink(link);
  };

  // Android has no calendar to ask about: a one-time lesson is added at once,
  // and a weekly one opens the sheet already at its second question.
  // Everyone else is asked which calendar they use first.
  const handleCalendarClick = (): void => {
    const isOnce = occurrence.schedule.kind === 'once';
    if (calendarPlatformOf(navigator.userAgent) === 'android') {
      if (isOnce) {
        addOneEvent('google');
        return;
      }
      trackEvent(MIXPANEL_EVENTS.calendarSheetOpen, { kind: 'weekly' });
      setSheet({ step: 'scope', calendar: 'google', canGoBack: false });
      return;
    }
    trackEvent(MIXPANEL_EVENTS.calendarSheetOpen, { kind: isOnce ? 'once' : 'weekly' });
    setSheet({ step: 'calendar' });
  };

  // A one-time lesson has only the one choice left after the calendar, so the
  // tap adds it; a weekly one asks which.
  const handleCalendarChosen = (calendar: CalendarChoice): void => {
    if (occurrence.schedule.kind === 'once') {
      addOneEvent(calendar);
      return;
    }
    setSheet({ step: 'scope', calendar, canGoBack: true });
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

      {sheet.step !== 'closed' && calendarOccurrence && (
        <CalendarSheet
          {...{
            dateLabel: occurrenceWhenLabel(calendarOccurrence),
            step: sheet,
            onChooseCalendar: handleCalendarChosen,
            onAddOneEvent: () => sheet.step === 'scope' && addOneEvent(sheet.calendar),
            onSubscribe: () => sheet.step === 'scope' && subscribe(sheet.calendar),
            onBack: () => setSheet({ step: 'calendar' }),
            onDismiss: closeSheet,
          }}
        />
      )}
    </div>
  );
})`
  ${styles.LessonActions}
`;
