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

// Where the calendar sheet is. `scope` keeps the calendar already chosen. Android
// is never asked, so it opens at `scope` on Google with nothing to go back to:
// the only state where `canGoBack` is false. Closed is the one state with no
// step, so every other reopening starts at the calendar question.
export type CalendarSheetStep =
  | { step: 'calendar' }
  | { step: 'scope'; calendar: CalendarChoice; canGoBack: true }
  | { step: 'scope'; calendar: 'google'; canGoBack: false };

export type CalendarSheetState = { step: 'closed' } | CalendarSheetStep;
