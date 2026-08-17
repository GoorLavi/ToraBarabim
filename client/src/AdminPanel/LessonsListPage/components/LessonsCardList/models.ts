import type { AdminLessonRow } from '~/AdminPanel/LessonsListPage/models';

export interface LessonsCardListProps {
  className?: string;
  rows: AdminLessonRow[];
}
