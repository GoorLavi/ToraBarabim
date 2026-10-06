import type { LessonOccurrenceDetail } from '@torabarabim/common';

export interface LessonActionsProps {
  className?: string;
  occurrence: LessonOccurrenceDetail;
}

export type CalendarPlatform = 'android' | 'other';

// What a calendar choice opens: an `.ics` file or a `webcal://` link, which
// hand themselves to the phone's own calendar, or a Google Calendar link.
export interface CalendarLink {
  href: string;
  target: 'ics' | 'google' | 'webcal';
}
