import type { DuplicateCourseRequest } from '@torabarabim/common';

export interface DuplicateCourseSheetProps {
  className?: string;
  courseName: string;
  // Prefilled as one higher than this when the source course has a cycle;
  // empty when it does not.
  sourceCycle: number | undefined;
  isPending: boolean;
  errorMessage: string | undefined;
  onConfirm: (body: DuplicateCourseRequest) => void;
  onDismiss: () => void;
}
