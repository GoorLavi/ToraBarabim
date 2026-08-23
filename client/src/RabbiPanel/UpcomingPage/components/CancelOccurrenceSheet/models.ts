import type { UpcomingOccurrence } from '~/RabbiPanel/UpcomingPage/models';

export interface CancelOccurrenceSheetProps {
  className?: string;
  occurrence: UpcomingOccurrence;
  onDismiss: () => void;
}
