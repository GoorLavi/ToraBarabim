import { createHash } from 'node:crypto';

import type { PlanCoreResult } from './models';

// A stable fingerprint of what a plan would do, independent of array order:
// `apply` recomputes the plan from the current database and the file it was
// handed, and a different digest than the one the caller supplied means
// something changed underneath the plan (a decision, a rabbi, a hand edit)
// since it was computed. Deliberately excludes `skipped`, which is
// informational and would otherwise make a harmless server-side wording
// change look like a changed plan.
export const computeDigest = (fileSha256: string, plan: PlanCoreResult): string => {
  const sortByKey = <T>(items: T[], key: (item: T) => string): T[] => [...items].sort((a, b) => key(a).localeCompare(key(b)));

  const canonical = {
    fileSha256,
    additions: sortByKey(plan.resolvedWrites.filter((write) => !write.existingLessonId), (write) => write.importKey),
    updates: sortByKey(
      plan.resolvedWrites.filter((write) => write.existingLessonId),
      (write) => write.importKey,
    ).map((write) => ({ importKey: write.importKey, existingLessonId: write.existingLessonId })),
    deletions: sortByKey(plan.deletions, (item) => `${item.lessonId}`),
    withheld: sortByKey(plan.withheldIfUnacked, (item) => item.lessonId),
    questions: sortByKey(plan.questions, (item) => `${item.nameKey}|${item.source}`),
    newLinks: sortByKey(plan.newLinks, (item) => `${item.nameKey}|${item.source}`),
  };

  return createHash('sha256').update(JSON.stringify(canonical)).digest('hex');
};

export const sha256Of = (value: string): string => createHash('sha256').update(value).digest('hex');
