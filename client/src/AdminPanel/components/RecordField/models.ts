export interface RecordFieldProps {
  className?: string;
  label: string;
  value: string;
  // True when `value` is a placeholder standing in for data that was never
  // entered (e.g. "לא הוזן תואר"), so the row reads as absent rather than as
  // a real answer.
  isEmpty?: boolean;
}
