import type { AdminLessonRow } from '~/AdminPanel/LessonsListPage/models';

export interface LessonsTableProps {
  className?: string;
  rows: AdminLessonRow[];
}
