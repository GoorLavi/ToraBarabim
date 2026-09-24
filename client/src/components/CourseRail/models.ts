import type { CourseSummary } from '@torabarabim/common';

import type { CourseSurface } from '~/analytics/consts';

export interface CourseRailProps {
  className?: string;
  title: string;
  items: CourseSummary[];
  // Named for the `Course Click` event, not for where this rail sits on the
  // page: the home page always passes `'homeRail'`, and every other caller
  // passes its own page.
  surface: CourseSurface;
}
