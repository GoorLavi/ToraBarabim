import type { RabbiDirectoryEntry, RabbiHonorific } from '@torabarabim/common';

import type { RabbiDirectory } from './models';

// /rabbis is ravs only, /women/rabbaniyot is rabbaniyot only (owner
// decision A3), so the whole directory shares one grammatical gender: no
// per-entry check is needed the way `rabbiMatchCountLabel` below needs one
// for a mixed set of search results.
export const rabbiCountLabel = (count: number, directory: RabbiDirectory): string => {
  if (directory === 'rabbaniyot') return count === 1 ? 'רבנית אחת' : `${count} רבניות`;
  return count === 1 ? 'רב אחד' : `${count} רבנים`;
};

export const rabbiMatchCountLabel = (matches: RabbiDirectoryEntry[]): string => {
  const count = matches.length;
  if (count === 1) {
    const [onlyMatch] = matches;
    return onlyMatch?.honorific === 'rabbanit' ? 'נמצאה רבנית אחת' : 'נמצא רב אחד';
  }

  const allRabbaniyot = matches.every((rabbi) => rabbi.honorific === 'rabbanit');
  // Masculine plural is Hebrew's generic for a mixed or all-ravs group, not a default picked here.
  return allRabbaniyot ? `נמצאו ${count} רבניות` : `נמצאו ${count} רבנים`;
};

// Longest-first is unnecessary here: the lookahead requires the matched word
// to end at a space or the string's end, so "רב" never matches inside
// "רבנית" even though it is a literal prefix of it.
const LEADING_HONORIFIC_PATTERNS: [pattern: RegExp, honorific: RabbiHonorific][] = [
  [/^הרבנית(?=\s|$)/, 'rabbanit'],
  [/^רבנית(?=\s|$)/, 'rabbanit'],
  [/^הרב(?=\s|$)/, 'rav'],
  [/^רב(?=\s|$)/, 'rav'],
];

const matchLeadingHonorific = (query: string): { honorific: RabbiHonorific; rest: string } | null => {
  for (const [pattern, honorific] of LEADING_HONORIFIC_PATTERNS) {
    const match = query.match(pattern);
    if (match) return { honorific, rest: query.slice(match[0].length).trim() };
  }
  return null;
};

// Local, case-insensitive substring match against the bare stored name
// (`common/src/rabbi.ts`). A leading "הרב"/"הרבנית"/"רב"/"רבנית" is stripped
// first, since it is redundant against the bare name. A query that is only
// the honorific word, with nothing left after stripping, instead filters to
// rabbis carrying that honorific.
export const filterRabbisByName = (rabbis: RabbiDirectoryEntry[], query: string): RabbiDirectoryEntry[] => {
  const needle = query.trim();
  if (!needle) return rabbis;

  const leadingHonorific = matchLeadingHonorific(needle);
  if (leadingHonorific) {
    if (!leadingHonorific.rest) return rabbis.filter((rabbi) => rabbi.honorific === leadingHonorific.honorific);
    const rest = leadingHonorific.rest.toLowerCase();
    return rabbis.filter((rabbi) => rabbi.name.toLowerCase().includes(rest));
  }

  const lowerNeedle = needle.toLowerCase();
  return rabbis.filter((rabbi) => rabbi.name.toLowerCase().includes(lowerNeedle));
};
