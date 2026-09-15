import type { RabbiDirectoryEntry, RabbiHonorific } from '@torabarabim/common';

export const rabbiCountLabel = (count: number): string => (count === 1 ? 'רב אחד' : `${count} רבנים`);

export const rabbiMatchCountLabel = (count: number): string => (count === 1 ? 'נמצא רב אחד' : `נמצאו ${count} רבנים`);

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
