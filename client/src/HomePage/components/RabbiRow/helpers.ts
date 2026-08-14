import type { LessonOccurrence, Rabbi } from '@torabarabim/common';

// There is no rabbis endpoint yet, so the browse-by-rabbi row is derived
// from the lessons already fetched for the page rather than a new server
// call. Only the regularly scheduled rabbi counts, not a one-off
// substitute, since a substitution is an exception, not a browsable
// identity.
export const uniqueRabbis = (items: LessonOccurrence[]): Rabbi[] => {
  const byId = new Map<string, Rabbi>();
  for (const item of items) {
    if (!byId.has(item.rabbi.id)) byId.set(item.rabbi.id, item.rabbi);
  }
  return [...byId.values()];
};
