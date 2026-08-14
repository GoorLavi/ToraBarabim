const ISRAEL_TIME_ZONE = 'Asia/Jerusalem';

// en-CA formats as YYYY-MM-DD. Intl with an explicit IANA zone stays
// correct across Israel's DST transitions, unlike `new Date().toISOString()`.
// This mirrors server/src/service/lesson/israel-time.ts; it is not imported
// from there because server does not publish it as a package, only server
// itself uses it. Worth extracting to a shared package if a third caller
// needs it.
const israelDateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: ISRAEL_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export const todayInIsrael = (now: Date): string => israelDateFormatter.format(now);

export const compareIsoDates = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

export const addDays = (isoDate: string, days: number): string => {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

// 0 = Sunday, matching how the rest of the codebase counts weekdays.
export const weekdayOfIsoDate = (isoDate: string): number => new Date(`${isoDate}T00:00:00Z`).getUTCDay();
