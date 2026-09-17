import type { ResolvedLessonOccurrence } from './models';

// Drops every occurrence of the lesson the reader is already on, then keeps
// only the first occurrence of each remaining lesson: a search window can
// hold several occurrences of one weekly-or-daily lesson, and without this a
// thin area would render the same lesson two or three times. `items` is
// already sorted soonest-first by `search`, so "first" is "soonest".
export const selectAreaPreview = (
  items: ResolvedLessonOccurrence[],
  excludeLessonId: string,
  limit: number,
): ResolvedLessonOccurrence[] => {
  const seenLessonIds = new Set<string>();
  const deduplicated: ResolvedLessonOccurrence[] = [];

  for (const item of items) {
    if (item.lessonId === excludeLessonId) continue;
    if (seenLessonIds.has(item.lessonId)) continue;
    seenLessonIds.add(item.lessonId);
    deduplicated.push(item);
  }

  return deduplicated.slice(0, limit);
};
