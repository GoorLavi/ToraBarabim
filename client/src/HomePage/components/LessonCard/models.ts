import type { LessonOccurrence } from '@torabarabim/common';

import type { LessonClickContext } from '~/analytics/models';

export interface LessonCardProps {
  className?: string;
  lesson: LessonOccurrence;
  clickContext: LessonClickContext;
}
