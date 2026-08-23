import type { RabbiLessonResponse } from '@torabarabim/common';

export interface LessonsListPageProps {
  className?: string;
}

export type LessonsListState =
  | { status: 'pending' }
  | { status: 'error'; retry: () => void }
  | { status: 'success'; lessons: RabbiLessonResponse[] };
