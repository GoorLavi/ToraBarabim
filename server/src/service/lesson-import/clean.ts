import type { RabbiHonorific, Weekday } from '@torabarabim/common';

import { stripLeadingHonorific } from '../shared/name';
import { toSlug } from '../shared/slug';
import { BUILT_IN_CITY_ALIASES, BUILT_IN_WEEKDAY_NAMES, BUILT_IN_WEEKDAY_NOTES, SYNAGOGUE_DISPLAY_NAME, SYNAGOGUE_NAME_VARIANTS, SYNAGOGUE_SLUG } from './consts';

// The cleaned, honorific-stripped form of a row's rabbi name: trimmed,
// lower-cased, inner whitespace collapsed, so "אייל עמרמי" and
// "אייל  עמרמי " key the same link. Deliberately not `toSlug`: a link's
// `nameKey` reads better as the plain cleaned name, and nothing here
// depends on slug-level spelling normalisation.
export const nameKeyOf = (rabbiName: string): string => stripLeadingHonorific(rabbiName).trim().toLowerCase().replace(/\s+/g, ' ');

// A row's raw rabbi name sometimes carries its own honorific ("הרבנית שרה
// גולדברג"). When it does, resolution (both an existing link's candidate
// list and auto-linking) must only ever consider a rabbi of that same
// honorific: a rabbanit is never a candidate for a row that named "הרב X",
// and the reverse. `undefined` when the row's text carries neither, in
// which case resolution does not filter by honorific at all.
export const honorificFromRawName = (rabbiName: string): RabbiHonorific | undefined => {
  const trimmed = rabbiName.trim();
  // "הרבנית" checked first: it starts with the same three letters as
  // "הרב", so checking "הרב" first would misread every rabbanit's row.
  if (/^הרבנית(\s|$)/.test(trimmed)) return 'rabbanit';
  if (/^הרב(\s|$)/.test(trimmed)) return 'rav';
  return undefined;
};

// A venue name (never the street) normalised through the same `toSlug`
// every other display name goes through: spacing, quotes and punctuation
// differences vanish. It is the place segment of every key written before
// the time-based key, and the first step of `placeMatchKeyOf`.
export const addressKeyOf = (address: string): string => toSlug(address);

// A lesson is its rabbi, its day and its exact start time; the place is not
// part of its identity.
export const weeklyImportKey = (rabbiId: string, weekday: Weekday, startTime: string): string => `${rabbiId}|w${weekday}|t${startTime}`;
export const onceImportKey = (rabbiId: string, isoDate: string, startTime: string): string => `${rabbiId}|d${isoDate}|t${startTime}`;

// Plain code-point order. `localeCompare` and `<` on strings compare in
// ways that depend on the runtime's locale data or on UTF-16 units, and a
// plan must come out the same on every machine.
export const compareCodePoints = (a: string, b: string): number => {
  const pointsA = Array.from(a);
  const pointsB = Array.from(b);
  const length = Math.min(pointsA.length, pointsB.length);
  for (let index = 0; index < length; index += 1) {
    const difference = ((pointsA[index] as string).codePointAt(0) ?? 0) - ((pointsB[index] as string).codePointAt(0) ?? 0);
    if (difference !== 0) return difference;
  }
  return pointsA.length - pointsB.length;
};

const SYNAGOGUE_VARIANT_PATTERNS = SYNAGOGUE_NAME_VARIANTS.map((variant) => new RegExp(`(?<=^|-)${variant}(?=-|$)`, 'gu'));

// A place name as the planner compares it: `toSlug`, then every spelling of
// "בית הכנסת" rewritten to one. Applying it to its own output changes
// nothing, so it also normalises the place segment of an old-form stored key.
export const placeMatchKeyOf = (place: string): string =>
  SYNAGOGUE_VARIANT_PATTERNS.reduce((slug, pattern) => slug.replace(pattern, SYNAGOGUE_SLUG), addressKeyOf(place));

const SYNAGOGUE_SLUG_PATTERN = new RegExp(`(?<=^|-)${SYNAGOGUE_SLUG}(?=-|$)`, 'u');

// Synagogues only: a beit midrash, a yeshiva, a kollel, an institute or a
// home never matches, so the import never creates a place for one.
export const isSynagogueName = (place: string): boolean => SYNAGOGUE_SLUG_PATTERN.test(placeMatchKeyOf(place));

const SINGLE_WORD_VARIANT_SLUGS = new Set(SYNAGOGUE_NAME_VARIANTS.filter((variant) => !variant.includes('-')));
const WRAPPING_QUOTES = /^["'`׳״“”„]+|["'`׳״“”„]+$/gu;

// The name a created synagogue is given: the variant words become
// "בית הכנסת", parentheses and quotes that wrap a word are removed (an
// abbreviation's own gershayim, as in חב"ד, stay), whitespace is collapsed.
export const synagogueDisplayName = (place: string): string => {
  const words = place
    .replace(/[()]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 0);
  const result: string[] = [];
  for (let index = 0; index < words.length; index += 1) {
    const word = words[index] as string;
    const next = words[index + 1];
    if (next !== undefined && toSlug(word) === 'בית' && toSlug(next) === 'כנסת') {
      result.push(SYNAGOGUE_DISPLAY_NAME);
      index += 1;
    } else if (SINGLE_WORD_VARIANT_SLUGS.has(toSlug(word))) {
      result.push(SYNAGOGUE_DISPLAY_NAME);
    } else {
      const unwrapped = word.replace(WRAPPING_QUOTES, '');
      if (unwrapped.length > 0) result.push(unwrapped);
    }
  }
  return result.join(' ');
};

// A stored import key in either of its two forms. The time form is
// `rabbi|day|t<HH:mm>`; the place form (every key written before this
// change) is `rabbi|day|<place slug>`. `toSlug` turns a colon into a
// hyphen, so a place slug can never be mistaken for the time segment.
export type ParsedImportKey =
  | { form: 'time'; rabbiId: string; day: string; startTime: string }
  | { form: 'place'; rabbiId: string; day: string; placeMatchKey: string };

export const parseImportKey = (key: string): ParsedImportKey | undefined => {
  const parts = key.split('|');
  const [rabbiId, day, tail] = parts;
  if (parts.length !== 3 || !rabbiId || !tail || !day || !/^(w[0-6]|d\d{4}-\d{2}-\d{2})$/.test(day)) return undefined;
  const timeMatch = /^t(\d{2}:\d{2})$/.exec(tail);
  if (timeMatch) return { form: 'time', rabbiId, day, startTime: timeMatch[1] as string };
  return { form: 'place', rabbiId, day, placeMatchKey: placeMatchKeyOf(tail) };
};

export const cleanWeekdayText = (text: string): string => text.trim();

export const resolveWeekday = (weekdayText: string): Weekday | undefined => BUILT_IN_WEEKDAY_NAMES[cleanWeekdayText(weekdayText)];

// A note for a weekday text that carries more than "which day" (e.g.
// "שישי וערבי חג"), or `undefined` for a plain weekday.
export const resolveWeekdayNote = (weekdayText: string): string | undefined => BUILT_IN_WEEKDAY_NOTES[cleanWeekdayText(weekdayText)];

// Postgres's `Date#getDay`-equivalent for an ISO date string, computed in
// UTC so the calendar date never shifts by the runtime's local timezone.
export const weekdayOfIsoDate = (isoDate: string): Weekday => {
  const date = new Date(`${isoDate}T00:00:00Z`);
  return date.getUTCDay() as Weekday;
};

// Trims and collapses whitespace, drops a trailing parenthetical aside
// ("ירושלים (פסגת זאב)" names a neighbourhood, not a different city), and
// normalises the "קריית" spelling to "קרית", the spelling every "קרית
// ..." city carries in the official `cities` table.
export const cleanCityText = (text: string): string =>
  text
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\s*\([^)]*\)\s*$/, '')
    .trim()
    .replace(/קריית/g, 'קרית');

// Resolves a row's free-text city against the built-in alias map only; the
// caller layers the learned `city_alias` rules and the real `cities` table
// lookup on top, since those need the database.
export const resolveBuiltInCityAlias = (cityText: string): string | undefined => {
  const cleaned = cleanCityText(cityText);
  return BUILT_IN_CITY_ALIASES[cleaned];
};
