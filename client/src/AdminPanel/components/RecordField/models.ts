export interface RecordFieldProps {
  className?: string;
  label: string;
  value: string;
  // True when `value` is a placeholder standing in for data that was never
  // entered (e.g. "לא הוזן תואר"), so the row reads as absent rather than as
  // a real answer.
  isEmpty?: boolean;
  // 'auto' (the default) is right for a name, a place, a note. A clock time
  // like '19:30' has no strong-direction character for 'auto' to key off, so
  // a caller showing one passes 'ltr' explicitly.
  valueDir?: 'auto' | 'ltr';
}
