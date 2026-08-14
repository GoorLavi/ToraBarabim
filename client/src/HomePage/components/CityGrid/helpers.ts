import type { LessonOccurrence } from '@torabarabim/common';

// There is no "list cities" endpoint (GET /v1/cities requires a `q`), so the
// browse-by-city grid is derived from the lessons already fetched for the
// page, the same honest approach the brief specifies for the by-rabbi row.
export const uniqueCityNames = (items: LessonOccurrence[]): string[] => {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const item of items) {
    if (!seen.has(item.place.city)) {
      seen.add(item.place.city);
      names.push(item.place.city);
    }
  }
  return names;
};
