import { MAX_YEARLESS_DATE_SPAN_DAYS } from './consts';

const FULL_DATE_PATTERN = /(\d{1,2})[./-](\d{1,2})[./-](\d{4})/;
const YEARLESS_DATE_PATTERN = /(\d{1,2})[./-](\d{1,2})(?!\d)/;

const daysBetweenUtc = (a: Date, b: Date): number =>
  Math.round((b.getTime() - a.getTime()) / (24 * 60 * 60 * 1000));

const buildIsoDate = (year: number, month: number, day: number): string | undefined => {
  if (month < 1 || month > 12 || day < 1 || day > 31) return undefined;
  const date = new Date(Date.UTC(year, month - 1, day));
  // Rejects e.g. day 31 of a 30-day month, which Date would otherwise
  // silently roll into the next month.
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return undefined;
  }
  return date.toISOString().slice(0, 10);
};

// Parses a date such as "13.08.2026", "9.8", or "9/8" into an ISO date. A
// date with no year is resolved against `referenceIsoDate`, the date the
// poster is known to cover, by picking whichever nearby year lands closest
// to it. A poster read months after it was published (a January schedule
// still cached in December) must still resolve to the year it was actually
// published for, not to whatever year happens to be current.
export const parseDate = (text: string, referenceIsoDate: string): string | undefined => {
  const fullMatch = FULL_DATE_PATTERN.exec(text);
  if (fullMatch) {
    const [, day, month, year] = fullMatch as unknown as [string, string, string, string];
    return buildIsoDate(Number(year), Number(month), Number(day));
  }

  const yearlessMatch = YEARLESS_DATE_PATTERN.exec(text);
  if (!yearlessMatch) return undefined;
  const [, day, month] = yearlessMatch as unknown as [string, string, string];

  const reference = new Date(`${referenceIsoDate}T00:00:00Z`);
  const referenceYear = reference.getUTCFullYear();

  const candidates = [referenceYear - 1, referenceYear, referenceYear + 1]
    .map((year) => buildIsoDate(year, Number(month), Number(day)))
    .filter((iso): iso is string => iso !== undefined);

  if (candidates.length === 0) return undefined;

  const closest = candidates.reduce((best, candidate) => {
    const bestSpan = Math.abs(daysBetweenUtc(reference, new Date(`${best}T00:00:00Z`)));
    const candidateSpan = Math.abs(daysBetweenUtc(reference, new Date(`${candidate}T00:00:00Z`)));
    return candidateSpan < bestSpan ? candidate : best;
  });

  const span = Math.abs(daysBetweenUtc(reference, new Date(`${closest}T00:00:00Z`)));
  return span <= MAX_YEARLESS_DATE_SPAN_DAYS ? closest : undefined;
};
