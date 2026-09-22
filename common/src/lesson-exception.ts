import type { LessonAddress } from './venue';

// A single-date override of a Lesson's recurrence rule. Never mutates the
// rule itself, so cancelling one week never affects any other week. Its own
// override is always a free-text address, never a place reference: moving
// one date is a correction for that date, not a reason to register a venue.
export type LessonException =
  | { kind: 'cancelled'; lessonId: string; date: string; reason?: string }
  | {
      kind: 'modified';
      lessonId: string;
      date: string;
      startTime?: string;
      address?: LessonAddress;
      substituteRabbiId?: string;
      note?: string;
    };
