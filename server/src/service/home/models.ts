import type { HomeRowId, LessonAudience, LessonTopic, Place, Rabbi } from '@torabarabim/common';

// Kept distinct from the wire `LessonOccurrence`: it carries the sort-only
// `rabbiProminenceRank` and `shuffleKey`, which the convertor must drop
// before anything reaches the client.
export interface ResolvedHomeOccurrence {
  lessonId: string;
  date: string;
  startTime: string;
  endTime: string;
  title?: string;
  topic?: LessonTopic;
  audience: LessonAudience;
  recurrenceKind: 'weekly' | 'once';
  rabbi: Rabbi;
  place: Place;
  substituteRabbi?: Rabbi;
  note?: string;
  rabbiProminenceRank: number;
  shuffleKey: number;
}

export interface HomeRowResult {
  id: HomeRowId;
  title: string;
  items: ResolvedHomeOccurrence[];
}

export interface HomeResult {
  rows: HomeRowResult[];
}
