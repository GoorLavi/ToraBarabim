export interface RecordFieldProps {
  className?: string;
  label: string;
  value: string;
  // True when `value` is a placeholder standing in for data that was never
  // entered (e.g. "לא הוזן תואר"), so the row reads as absent rather than as
  // a real answer.
  isEmpty?: boolean;
  // Renders `value` as a link to another admin record (a course's own
  // linked rabbi, `CourseViewPage`), rather than plain text.
  linkTo?: string;
  // `<bdi>`'s own auto-detection reads a value's first strong directional
  // character; a phone number's digits have none, so a caller whose value
  // is always Latin (a phone number) states its direction instead of
  // leaving it to guess.
  valueDir?: 'ltr' | 'rtl';
}
