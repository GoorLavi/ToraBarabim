import type { ResolvedLessonOccurrence } from './models';

// `items` is already sorted soonest-first by `findOccurrences`, so "first" is
// "soonest". A window can hold several occurrences of one weekly-or-daily
// lesson, and a row of cards must show each lesson once.
const firstOccurrencePerLesson = (items: ResolvedLessonOccurrence[]): ResolvedLessonOccurrence[] => {
  const seenLessonIds = new Set<string>();
  return items.filter((item) => {
    if (seenLessonIds.has(item.lessonId)) return false;
    seenLessonIds.add(item.lessonId);
    return true;
  });
};

// Every lesson of the viewed lesson's rabbi is left out (the rabbi row above
// already carries them), then each remaining lesson appears once, by its
// soonest occurrence, cancelled included.
export const selectAreaPreview = (
  items: ResolvedLessonOccurrence[],
  excludeRabbiId: string,
  limit: number,
): ResolvedLessonOccurrence[] =>
  firstOccurrencePerLesson(items.filter((item) => item.rabbi.id !== excludeRabbiId)).slice(0, limit);

const occurrenceKey = (item: ResolvedLessonOccurrence): string => `${item.lessonId}:${item.date}`;

// One rabbi's coming-up row. The viewed `(lessonId, date)` pair is dropped
// first. Each lesson shows its soonest occurrence, and when that one is
// cancelled, the soonest scheduled one after it too, so a cancelled date
// never hides the lesson's next real date. The viewed lesson's cards go
// first and the rest keep the date order `items` already has.
export const selectRabbiUpcoming = (
  items: ResolvedLessonOccurrence[],
  viewed: { lessonId: string; date: string },
  limit: number,
): ResolvedLessonOccurrence[] => {
  const candidates = items.filter((item) => !(item.lessonId === viewed.lessonId && item.date === viewed.date));
  const soonestScheduledByLesson = new Map(
    firstOccurrencePerLesson(candidates.filter((item) => item.status === 'scheduled')).map((item) => [item.lessonId, item] as const),
  );

  const selectedKeys = new Set<string>();
  for (const soonest of firstOccurrencePerLesson(candidates)) {
    selectedKeys.add(occurrenceKey(soonest));
    if (soonest.status !== 'cancelled') continue;
    const nextScheduled = soonestScheduledByLesson.get(soonest.lessonId);
    if (nextScheduled) selectedKeys.add(occurrenceKey(nextScheduled));
  }

  const selected = candidates.filter((item) => selectedKeys.has(occurrenceKey(item)));
  const viewedLessonFirst = [
    ...selected.filter((item) => item.lessonId === viewed.lessonId),
    ...selected.filter((item) => item.lessonId !== viewed.lessonId),
  ];
  return viewedLessonFirst.slice(0, limit);
};
