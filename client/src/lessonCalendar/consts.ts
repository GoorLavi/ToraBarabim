import { SITE_ORIGIN } from '../../consts';
import type { CalendarEventKind } from './models';

export const CALENDAR_SITE_HOST = new URL(SITE_ORIGIN).host;

export const CALENDAR_UTM_SOURCE = 'calendar';

// A return from the calendar is measurable per surface: the one-off add and
// the subscribed feed are different decisions a visitor made.
export const CALENDAR_UTM_MEDIUMS: Record<CalendarEventKind, string> = {
  static: 'event',
  feed: 'feed',
};

export const GOOGLE_CALENDAR_RENDER_URL = 'https://calendar.google.com/calendar/render';

export const DEFAULT_EVENT_TITLE = 'שיעור';
export const CANCELLED_SUMMARY_PREFIX = 'מבוטל: ';

// Only the two audiences that are not "both": a lesson open to everyone adds
// nothing to its own title.
export const AUDIENCE_SUMMARY_SUFFIXES = {
  men: 'לגברים',
  women: 'לנשים',
} as const;

export const AUDIENCE_LINE_PREFIX = 'קהל: ';
export const TOPIC_LINE_PREFIX = 'נושא: ';
export const LESSON_LINK_LINE_PREFIX = 'פרטים ועדכונים: ';
export const SITE_LINK_LINE_PREFIX = 'תורה ברבים: ';

// Draft, for the editor: only the one-off add carries it, because only that
// copy of the event goes stale.
export const STATIC_EVENT_DISCLAIMER = 'שינויים בשיעור לא מתעדכנים ביומן, הקישור למעלה תמיד עדכני.';
