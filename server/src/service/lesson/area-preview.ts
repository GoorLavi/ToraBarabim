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
  const selected: ResolvedLessonOccurrence[] = [];

  for (const item of items) {
    if (item.lessonId === excludeLessonId) continue;
    if (seenLessonIds.has(item.lessonId)) continue;
    seenLessonIds.add(item.lessonId);
    selected.push(item);
    if (selected.length === limit) break;
  }

  return selected;
};
