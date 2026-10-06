import type { CalendarChoice, CalendarSheetStep } from '../../models';

export interface CalendarSheetProps {
  className?: string;
  // The concrete date of the one occurrence "only one lesson" adds, already
  // phrased ("יום שלישי, 27 באוגוסט, בשעה 20:30").
  dateLabel: string;
  step: CalendarSheetStep;
  onChooseCalendar: (calendar: CalendarChoice) => void;
  onAddOneEvent: () => void;
  onSubscribe: () => void;
  onBack: () => void;
  onDismiss: () => void;
}
