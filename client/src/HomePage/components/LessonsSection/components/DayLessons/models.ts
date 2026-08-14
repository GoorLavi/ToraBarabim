import type { LessonOccurrence } from '@torabarabim/common';

export interface DayLessonsProps {
  className?: string;
  headingLabel: string;
  items: LessonOccurrence[];
  showSeeAllLink: boolean;
  moreLabel: string;
}
