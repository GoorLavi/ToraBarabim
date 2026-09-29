import type { CourseSummary } from '@torabarabim/common';

import type { CourseSurface } from '~/analytics/consts';
import type { LessonCardSurface } from '~/HomePage/components/LessonCard/models';

export interface CourseRailProps {
  className?: string;
  title: string;
  items: CourseSummary[];
  // `surface` picks the audience-line treatment (CourseCard/models.ts).
  // `clickSurface` names this rail for the Course Click event: the home page
  // always passes `'homeRail'`, and every other caller passes its own page.
  surface: LessonCardSurface;
  clickSurface: CourseSurface;
}
