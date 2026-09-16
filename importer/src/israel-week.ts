const ISRAEL_TIME_ZONE = 'Asia/Jerusalem';

const israelDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: ISRAEL_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

// Standalone (no server dependency, per the plan): "today" in Israel time
// as an ISO date, then the ISO 8601 week number (Monday-start, week 1 holds
// the year's first Thursday) computed from that date in UTC, so the
// calendar date never shifts by the runtime's own timezone.
export const isoWeekOf = (now: Date): string => {
  const isoDate = israelDateFormatter.format(now);
  const date = new Date(`${isoDate}T00:00:00Z`);

  // ISO weekday: Monday = 1 .. Sunday = 7.
  const isoWeekday = date.getUTCDay() === 0 ? 7 : date.getUTCDay();
  // Shift to the Thursday of this ISO week; the year of that Thursday is
  // the ISO week-numbering year, which can differ from the calendar year
  // right at the boundary.
  const thursday = new Date(date);
  thursday.setUTCDate(date.getUTCDate() - isoWeekday + 4);

  const yearStart = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(((thursday.getTime() - yearStart.getTime()) / (24 * 60 * 60 * 1000) + 1) / 7);

  return `${thursday.getUTCFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
};
