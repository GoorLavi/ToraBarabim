import type { LessonOccurrence } from '@torabarabim/common';

import type { LessonSurface } from '~/analytics/consts';
import type { LessonCardSurface } from '~/HomePage/components/LessonCard/models';

export interface LessonsGridProps {
  className?: string;
  items: LessonOccurrence[];
  // `surface` picks the audience-line treatment (LessonCard/models.ts).
  // `clickSurface` names this list for the Lesson Click event.
  surface: LessonCardSurface;
  clickSurface: Exclude<LessonSurface, 'homeRail'>;
}
