import type { RabbiDirectoryEntry } from '@torabarabim/common';

export const rabbiCountLabel = (count: number): string => (count === 1 ? 'רב אחד' : `${count} רבנים`);

// Local, case-insensitive substring match against the whole stored name,
// honorific included: the name is never re-split into a title and a given
// name (design spec, "no string in the code ever prepends הרב to a name").
export const filterRabbisByName = (rabbis: RabbiDirectoryEntry[], query: string): RabbiDirectoryEntry[] => {
  const needle = query.trim().toLowerCase();
  if (!needle) return rabbis;
  return rabbis.filter((rabbi) => rabbi.name.toLowerCase().includes(needle));
};
