import type { LessonPlace } from './lesson';

// A single-date override of a Lesson's recurrence rule. Never mutates the
// rule itself, so cancelling one week never affects any other week.
export type LessonException =
  | { kind: 'cancelled'; lessonId: string; date: string; reason?: string }
  | {
      kind: 'modified';
      lessonId: string;
      date: string;
      startTime?: string;
      place?: LessonPlace;
      substituteRabbiId?: string;
      note?: string;
    };
