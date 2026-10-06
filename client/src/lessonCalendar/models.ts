// `feed` is the subscribed per-lesson calendar; `static` is a one-off add of a
// single date (an `.ics` download or a prefilled Google Calendar link), which
// never updates afterwards and says so in its own description.
export type CalendarEventKind = 'feed' | 'static';

export interface CalendarEvent {
  // Stable across every fetch and across `feed` and `static`, so a calendar
  // updates the event it already holds instead of adding a second one.
  uid: string;
  startUtc: Date;
  endUtc: Date;
  summary: string;
  location: string;
  description: string;
  // The lesson page, tagged for the calendar surface that carries it.
  url: string;
  isCancelled: boolean;
}
