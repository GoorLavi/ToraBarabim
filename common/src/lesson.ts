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

// A lesson's venue, entered as free text: nobody needs to "recognise" a
// synagogue, and a rabbi must never be blocked from adding a lesson because
// its venue is not registered. `cityCode` stays structured, referencing
// `City.id`, because the home page and the city/area filters depend on it.
export interface LessonPlace {
  name: string;
  street: string;
  floor?: string;
  cityCode: number;
}

// The admin's read view of a venue: `LessonPlace` plus the city name
// resolved server-side, so an admin screen never has to hold or look up
// city reference data of its own just to show what it already received.
export interface ResolvedLessonPlace extends LessonPlace {
  cityName: string;
}

export interface Lesson {
  id: string;
  title?: string;
  rabbiId: string;
  place: LessonPlace;
  topic?: LessonTopic;
  audience: LessonAudience;
  recurrence: Recurrence;
  startTime: string; // 'HH:mm'
  durationMinutes: number;
  notes?: string;
}
