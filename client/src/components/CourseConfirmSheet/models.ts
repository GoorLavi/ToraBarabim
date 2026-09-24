export interface CourseConfirmSheetProps {
  className?: string;
  heading: string;
  // The body's own sentence(s) split around the course name, which always
  // renders in bold inside a `<bdi>`, never in quotation marks (design
  // brief B, "the course name in bold inside <bdi>").
  bodyBeforeName: string;
  courseName: string;
  bodyAfterName: string;
  confirmLabel: string;
  confirmVariant: 'primary' | 'danger';
  backLabel: string;
  isPending: boolean;
  errorMessage: string | undefined;
  onConfirm: () => void;
  onDismiss: () => void;
}
