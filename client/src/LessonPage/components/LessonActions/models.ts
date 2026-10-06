import type { LessonOccurrence, LessonOccurrenceDetail } from '@torabarabim/common';

export interface LessonActionsProps {
  className?: string;
  occurrence: LessonOccurrenceDetail;
}

export type CalendarPlatform = 'android' | 'other';

// The calendar the person says they use: Google's website, or whatever
// calendar app their phone or computer already has.
export type CalendarChoice = 'google' | 'device';

export type CalendarScope = 'one' | 'all';

// What a calendar choice opens: an `.ics` file or a `webcal://` link, which
// hand themselves to the phone's own calendar, or a Google Calendar link.
export interface CalendarLink {
  href: string;
  target: 'ics' | 'google' | 'webcal';
}

export type CalendarLinkRequest = { calendar: CalendarChoice; platform: CalendarPlatform } & (
  | { scope: 'one'; occurrence: LessonOccurrence }
  | { scope: 'all'; lessonId: string }
);

// Where the calendar sheet is. `scope` keeps the calendar already chosen, and
// `canGoBack` is false only where there was no choice to go back to (Android,
// whose calendar is always Google). Closed is the one state with no step, so
// every reopening starts at the calendar question.
export type CalendarSheetStep = { step: 'calendar' } | { step: 'scope'; calendar: CalendarChoice; canGoBack: boolean };

export type CalendarSheetState = { step: 'closed' } | CalendarSheetStep;
