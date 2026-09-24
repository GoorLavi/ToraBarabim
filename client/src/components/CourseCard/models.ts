import type { CourseSummary } from '@torabarabim/common';

import type { CourseClickContext } from '~/analytics/models';

export interface CourseCardProps {
  className?: string;
  course: CourseSummary;
  clickContext: CourseClickContext;
}
