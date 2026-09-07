import type { UpcomingOccurrence } from '~/RabbiPanel/UpcomingPage/models';

export interface OccurrenceCardProps {
  className?: string;
  occurrence: UpcomingOccurrence;
  onCancelClick: () => void;
  onMoveClick: () => void;
  onRestoreClick: () => void;
  isRestoring: boolean;
}
