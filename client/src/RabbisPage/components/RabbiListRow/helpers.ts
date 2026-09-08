import type { City, RabbiDirectoryEntry } from '@torabarabim/common';

const lessonCountLabel = (count: number): string => (count === 1 ? 'שיעור אחד' : `${count} שיעורים`);

const cityListLabel = (cities: City[]): string => {
  const [first, second] = cities;
  if (!first) return '';
  if (!second) return first.name;
  if (cities.length === 2) return `${first.name}, ${second.name}`;
  return `${first.name}, ${second.name} ועוד ${cities.length - 2} ערים`;
};

// "9 שיעורים · צפת" (design spec, "Meta line copy"). A rabbi with no lessons
// yet has no city to report either; the frames do not draw that case, but
// the admin can create a rabbi before its first lesson exists
// (design-system.md, "Layouts must survive real data").
export const rabbiMetaLine = (rabbi: RabbiDirectoryEntry): string => {
  const cityPart = cityListLabel(rabbi.cities);
  return cityPart ? `${lessonCountLabel(rabbi.lessonCount)} · ${cityPart}` : lessonCountLabel(rabbi.lessonCount);
};
