import type { OccurrenceRowData } from '~/AdminPanel/LessonViewPage/components/OccurrencesSection/models';

export interface CancelExceptionSheetProps {
  className?: string;
  lessonId: string;
  row: OccurrenceRowData;
  // Whether this lesson recurs weekly, so the confirm sentence's "other
  // dates stay as usual" clause only renders where it is true (a one-time
  // lesson has no other dates).
  isWeeklyRecurrence: boolean;
  onDismiss: () => void;
}
