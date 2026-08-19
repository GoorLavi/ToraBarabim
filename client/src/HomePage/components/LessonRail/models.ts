import type { LessonOccurrence } from '@torabarabim/common';

export interface LessonRailProps {
  className?: string;
  title: string;
  items: LessonOccurrence[];
}
