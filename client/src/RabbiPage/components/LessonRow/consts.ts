const ISRAEL_TIME_ZONE = 'Asia/Jerusalem';

// `weekday: 'short'` already renders Saturday as bare "שבת", with no "יום"
// prefix (unlike every other day, "יום ג׳"), which happens to be exactly
// the row's special case for Saturday (design spec, "Date copy"): no
// separate branch needed.
const weekdayFormatter = new Intl.DateTimeFormat('he-IL', { weekday: 'short', timeZone: ISRAEL_TIME_ZONE });
const dayMonthFormatter = new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'long', timeZone: ISRAEL_TIME_ZONE });

export const rowDateLabel = (isoDate: string): string => {
  const date = new Date(`${isoDate}T00:00:00Z`);
  return `${weekdayFormatter.format(date)}, ${dayMonthFormatter.format(date)}`;
};
