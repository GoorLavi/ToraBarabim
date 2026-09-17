import type { OccurrenceRowData } from '~/AdminPanel/LessonViewPage/components/OccurrencesSection/models';

export interface OccurrenceRowProps {
  className?: string;
  row: OccurrenceRowData;
  canWrite: boolean;
  onCancelClick: () => void;
  onMoveClick: () => void;
  onRestoreClick: () => void;
  isRestoring: boolean;
}
