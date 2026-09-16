import type { LessonOccurrence } from '@torabarabim/common';

import type { LessonSurface } from '~/analytics/consts';

export interface LessonsGridProps {
  className?: string;
  items: LessonOccurrence[];
  surface: Exclude<LessonSurface, 'homeRail'>;
}
