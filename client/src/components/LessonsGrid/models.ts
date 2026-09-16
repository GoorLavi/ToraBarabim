import type { LessonOccurrence } from '@torabarabim/common';

import type { LessonCardSurface } from '~/HomePage/components/LessonCard/models';

export interface LessonsGridProps {
  className?: string;
  items: LessonOccurrence[];
  surface: LessonCardSurface;
}
