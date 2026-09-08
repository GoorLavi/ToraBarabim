import type { LessonOccurrence } from '@torabarabim/common';

export interface DayGroupProps {
  className?: string;
  heading: string;
  items: LessonOccurrence[];
}
