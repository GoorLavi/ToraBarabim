import { compareIsoDates } from '../date-utils';
import type { CollectedLesson } from '../normalize/models';
import type { SnapshotDiff } from './models';

// A lesson that dropped out of `current` since the last snapshot: was it
// removed, or did it just fall off the site's rolling window? A one-off
// lesson whose date already passed is expiry, not a deletion, or every
// site that only lists the next two weeks would look like a mass
// cancellation on every run. A weekly recurring lesson has no such window,
// so its disappearance always means it was actually taken down. A lesson
// whose date we never resolved (a recurrence gap) cannot be proven to have
// expired, so it is reported for deletion rather than silently dropped:
// the safer default is a human double-checking a false positive, not a
// removal nobody hears about.
const isGenuineRemoval = (lesson: CollectedLesson, today: string): boolean => {
  if (!lesson.recurrence) return true;
  if (lesson.recurrence.kind === 'weekly') return true;
  return compareIsoDates(lesson.recurrence.date, today) >= 0;
};

export const diffSnapshot = (previous: CollectedLesson[], current: CollectedLesson[], today: string): SnapshotDiff => {
  const previousKeys = new Set(previous.map((lesson) => lesson.key));
  const currentKeys = new Set(current.map((lesson) => lesson.key));

  const newLessons = current.filter((lesson) => !previousKeys.has(lesson.key));
  const deletedKeys = previous
    .filter((lesson) => !currentKeys.has(lesson.key) && isGenuineRemoval(lesson, today))
    .map((lesson) => lesson.key);

  return { newLessons, deletedKeys };
};
