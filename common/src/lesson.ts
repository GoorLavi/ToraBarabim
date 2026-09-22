import type { LessonVenueInput } from './venue';

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

// Who a public lesson query is scoped to. The rule each value applies is
// `server/src/service/shared/audience-scope.ts`'s, the one place it lives.
export type AudienceScope = 'general' | 'women';

// Narrower than `LessonAudience` on purpose: a general surface never
// requests `women` directly.
export type AudienceFilter = 'men' | 'mixed';

export type Recurrence =
  | { kind: 'weekly'; weekdays: Weekday[] }
  | { kind: 'once'; date: string }; // ISO date, e.g. '2026-08-20'

export interface Lesson {
  id: string;
  title?: string;
  rabbiId: string;
  venue: LessonVenueInput;
  topic?: LessonTopic;
  audience: LessonAudience;
  recurrence: Recurrence;
  startTime: string; // 'HH:mm'
  durationMinutes: number;
  notes?: string;
}
