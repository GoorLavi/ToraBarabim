import type { LessonOccurrence } from '@torabarabim/common';

export interface DayGroup {
  date: string;
  items: LessonOccurrence[];
}
