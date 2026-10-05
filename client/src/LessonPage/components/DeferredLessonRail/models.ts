import type { DeferredLessons } from '~/LessonPage/models';

export interface DeferredLessonRailProps {
  title: string;
  titleTo: string;
  lessons: Promise<DeferredLessons>;
  emptyHeading: string;
  emptyBody: string;
}
