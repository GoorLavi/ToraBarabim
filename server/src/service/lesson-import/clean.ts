import type { RabbiHonorific, Weekday } from '@torabarabim/common';

import { stripLeadingHonorific } from '../shared/name';
import { toSlug } from '../shared/slug';
import { BUILT_IN_CITY_ALIASES, BUILT_IN_WEEKDAY_NAMES, BUILT_IN_WEEKDAY_NOTES } from './consts';

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

// A lesson's address key: the venue name only (never the street), normalised
// through the same `toSlug` every other display name goes through. Two
// spellings of the same shul name ("בית הכנסת מוסאיוף" vs "מוסאיוף ") key
// the same lesson.
export const addressKeyOf = (address: string): string => toSlug(address);

export const weeklyImportKey = (rabbiId: string, weekday: Weekday, address: string): string => `${rabbiId}|w${weekday}|${addressKeyOf(address)}`;
export const onceImportKey = (rabbiId: string, isoDate: string, address: string): string => `${rabbiId}|d${isoDate}|${addressKeyOf(address)}`;

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
