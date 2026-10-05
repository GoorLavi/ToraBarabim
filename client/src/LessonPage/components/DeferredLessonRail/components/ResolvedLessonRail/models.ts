import type { DeferredLessons } from '~/LessonPage/models';

export interface ResolvedLessonRailProps {
  className?: string;
  title: string;
  titleTo: string;
  resolved: DeferredLessons;
  // Shown, under the still-linked heading, when the read succeeded and found
  // nothing.
  emptyHeading: string;
  emptyBody: string;
}
