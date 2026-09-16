import type { LessonOccurrence } from '@torabarabim/common';

import type { LessonCardSurface } from '~/HomePage/components/LessonCard/models';

export interface DayGroupProps {
  className?: string;
  heading: string;
  items: LessonOccurrence[];
  surface: LessonCardSurface;
}
