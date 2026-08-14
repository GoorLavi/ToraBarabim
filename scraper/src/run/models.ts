import type { CollectedLesson } from '../normalize/models';

export type SourceRunStatus = 'ok' | 'empty' | 'failed';

export interface SourceRunResult {
  sourceId: string;
  sourceName: string;
  status: SourceRunStatus;
  error?: string;
  lessons: CollectedLesson[];
  newLessonKeys: string[];
  deletedLessonKeys: string[];
  // True whenever this run could not safely compute deletions: the source
  // failed outright, or came back with zero lessons. Either one must never
  // be read as "every lesson from this source was cancelled".
  deletionsSkipped: boolean;
}

export interface RunReport {
  runAt: string;
  results: SourceRunResult[];
}
