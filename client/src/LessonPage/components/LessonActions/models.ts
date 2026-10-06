import type { LessonOccurrenceDetail } from '@torabarabim/common';

export interface LessonActionsProps {
  className?: string;
  occurrence: LessonOccurrenceDetail;
}

export type CalendarPlatform = 'android' | 'other';

// How a calendar choice is opened: a new tab for a Google Calendar link,
// which Android handles in the Google Calendar app or the browser, or the
// current page for an `.ics` file or a `webcal://` link, which hand
// themselves to the phone's own calendar.
export interface CalendarLink {
  href: string;
  target: 'ics' | 'google' | 'webcal';
  opensInNewTab: boolean;
}
