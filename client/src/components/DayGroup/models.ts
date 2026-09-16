import type { LessonOccurrence } from '@torabarabim/common';

import type { LessonSurface } from '~/analytics/consts';

export interface DayGroupProps {
  className?: string;
  heading: string;
  items: LessonOccurrence[];
  surface: Exclude<LessonSurface, 'homeRail'>;
}
