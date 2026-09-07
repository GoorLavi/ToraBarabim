import type { Weekday } from '@torabarabim/common';

export const RECURRING_OPTION_LABEL = 'שיעור קבוע, כל שבוע';
export const ONE_TIME_OPTION_LABEL = 'שיעור חד־פעמי';
export const WEEKDAYS_LABEL = 'ימים בשבוע';
export const DATE_LABEL = 'תאריך';
export const START_TIME_LABEL = 'שעת התחלה';
export const DURATION_LABEL = 'משך השיעור (בדקות)';

// The literal array has exactly 7 entries, one per `Weekday` (0-6), so the
// index is a genuine `Weekday`; the cast is centralized here rather than
// repeated at every call site.
const WEEKDAY_SHORT_LABELS = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
export const WEEKDAY_OPTIONS: { value: Weekday; label: string }[] = WEEKDAY_SHORT_LABELS.map((label, index) => ({
  value: index as Weekday,
  label,
}));
