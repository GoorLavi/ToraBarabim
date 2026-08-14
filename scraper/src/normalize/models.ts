import type { Area, LessonAudience, LessonTopic, Recurrence } from '@torabarabim/common';

// A field the source did not publish, or published in a form that could
// not be parsed without guessing. Named after the CollectedLesson field it
// corresponds to.
export type GapField =
  | 'title'
  | 'topic'
  | 'audience'
  | 'rabbiName'
  | 'placeName'
  | 'address'
  | 'city'
  | 'recurrence'
  | 'startTime'
  | 'endTime'
  | 'durationMinutes';

export interface CollectedPlace {
  name?: string;
  address?: string;
  cityName?: string;
  area?: Area;
}

// What a source currently publishes, converted into the shared domain
// vocabulary. Shaped to match the `Lesson`/`Place` tables it will one day
// be imported into, but every field stays optional and referenced by name
// rather than id, since nothing here has been matched to a rabbi or place
// row yet.
export interface CollectedLesson {
  // `${sourceId}:${sourceItemId}`, stable across runs.
  key: string;
  sourceId: string;
  sourceItemId: string;
  collectedAt: string; // ISO datetime of this run
  title?: string;
  topic?: LessonTopic;
  audience?: LessonAudience;
  rabbiName?: string;
  place: CollectedPlace;
  recurrence?: Recurrence;
  startTime?: string; // 'HH:mm'
  endTime?: string; // 'HH:mm'
  durationMinutes?: number;
  notes?: string;
  gaps: GapField[];
}
