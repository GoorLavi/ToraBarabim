const ISRAEL_TIME_ZONE = 'Asia/Jerusalem';
const longDateFormatter = new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'long', timeZone: ISRAEL_TIME_ZONE });

// "הקורס נפתח ב־3 בנובמבר ונמשך 10 שבועות." (spec section 13's own
// wording), with the sitewide singular form when there is exactly one week.
// Not built on `courseOpeningDateLongLabel` (~/helpers.ts): that helper's
// own prefix is "פתיחה ב־", and this sentence's verb is "נפתח", so only the
// date itself, not the whole formatted string, is shared.
export const closedFactLine = (openingDate: string, weeks: number): string => {
  const dateLabel = longDateFormatter.format(new Date(`${openingDate}T00:00:00Z`));
  const weeksPart = weeks === 1 ? 'שבוע אחד' : `${weeks} שבועות`;
  return `הקורס נפתח ב־${dateLabel} ונמשך ${weeksPart}.`;
};
