import type { CourseResponse, DuplicateCourseRequest } from '@torabarabim/common';

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

// The one source for both panels' own thin wrapper around the sheet above
// (RabbiPanel/CourseFormPage and AdminPanel/CourseViewPage each own a
// `components/DuplicateCourseSheet/`): identical except for which
// panel-specific error-message helper each reads its mutation through.
export interface DuplicateCourseTriggerProps {
  courseId: string;
  courseName: string;
  sourceCycle: number | undefined;
  onDismiss: () => void;
  onDuplicated: (course: CourseResponse) => void;
}
