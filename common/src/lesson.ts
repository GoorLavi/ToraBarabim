// 0 = Sunday, matching Date#getDay in Israel where the week starts on Sunday.
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type LessonTopic =
  | 'gemara'
  | 'halacha'
  | 'parasha'
  | 'mussar'
  | 'chassidut'
  | 'tanach'
  | 'machshava'
  | 'other';

export type LessonAudience = 'men' | 'women' | 'mixed';

export type Recurrence =
  | { kind: 'weekly'; weekdays: Weekday[] }
  | { kind: 'once'; date: string }; // ISO date, e.g. '2026-08-20'

export interface Lesson {
  id: string;
  title?: string;
  rabbiId: string;
  placeId: string;
  topic?: LessonTopic;
  audience: LessonAudience;
  recurrence: Recurrence;
  startTime: string; // 'HH:mm'
  durationMinutes: number;
  notes?: string;
}
