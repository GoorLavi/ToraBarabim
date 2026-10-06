export interface CalendarSheetProps {
  className?: string;
  // The concrete date of the one occurrence "only one lesson" adds, already
  // phrased ("יום שלישי, 27 באוגוסט, בשעה 20:30").
  dateLabel: string;
  onAddOneEvent: () => void;
  onSubscribe: () => void;
  onDismiss: () => void;
}
