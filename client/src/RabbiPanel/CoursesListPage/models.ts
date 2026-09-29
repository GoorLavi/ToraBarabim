import type { CourseResponse } from '@torabarabim/common';

export interface CoursesListPageProps {
  className?: string;
}

export type CoursesListState =
  | { status: 'pending' }
  | { status: 'error'; retry: () => void }
  | { status: 'success'; courses: CourseResponse[] };
