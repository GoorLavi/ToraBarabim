import type { CourseSummary } from '@torabarabim/common';

import type { CourseClickContext } from '~/analytics/models';
import type { LessonCardSurface } from '~/HomePage/components/LessonCard/models';

export interface CourseCardProps {
  className?: string;
  course: CourseSummary;
  // Picks the audience-line treatment, the same as `LessonCard`'s own
  // `surface` (models.ts there): distinct from `clickContext.surface` below,
  // which only names this list for the Course Click event.
  surface: LessonCardSurface;
  clickContext: CourseClickContext;
}
