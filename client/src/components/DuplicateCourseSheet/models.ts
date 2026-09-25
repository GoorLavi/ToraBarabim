export interface DuplicateCourseRequestBody {
  openingDate: string;
  cycle: number | undefined;
}

export interface DuplicateCourseSheetProps {
  className?: string;
  courseName: string;
  // Prefilled as one higher than this when the source course has a cycle;
  // empty when it does not.
  sourceCycle: number | undefined;
  isPending: boolean;
  errorMessage: string | undefined;
  onConfirm: (body: DuplicateCourseRequestBody) => void;
  onDismiss: () => void;
}
