import type { LessonAudience, LessonTopic } from './lesson';
import type { Place } from './place';
import type { Rabbi } from './rabbi';

// What the search API actually returns: a Lesson's recurrence rule expanded
// across a date range, with any exception for that date already applied, and
// every id resolved to its record so the client never has to chase one.
export interface LessonOccurrence {
  lessonId: string;
  date: string; // ISO date
  startTime: string; // 'HH:mm'
  endTime: string; // 'HH:mm'
  status: 'scheduled' | 'cancelled';
  title?: string;
  topic?: LessonTopic;
  audience: LessonAudience;
  rabbi: Rabbi;
  place: Place;
  substituteRabbi?: Rabbi;
  cancellationReason?: string;
  note?: string;
}

export interface LessonSearchResponse {
  items: LessonOccurrence[];
  page: number;
  pageSize: number;
  total: number;
}
