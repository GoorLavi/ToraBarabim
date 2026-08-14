import type { CollectedLesson } from '../normalize/models';

export interface SourceSnapshot {
  sourceId: string;
  writtenAt: string; // ISO datetime
  lessons: CollectedLesson[];
}

export interface SnapshotDiff {
  newLessons: CollectedLesson[];
  // Keys of lessons that were published last run and are gone now, on a
  // date that has not passed: a genuine removal or cancellation.
  deletedKeys: string[];
}
