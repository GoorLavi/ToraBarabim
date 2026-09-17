import type { OccurrenceRowData } from '~/AdminPanel/LessonViewPage/components/OccurrencesSection/models';

export interface CancelExceptionSheetProps {
  className?: string;
  lessonId: string;
  row: OccurrenceRowData;
  onDismiss: () => void;
}
