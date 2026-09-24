import type { CourseResponse } from '@torabarabim/common';

export interface DuplicateCourseSheetProps {
  className?: string;
  courseId: string;
  courseName: string;
  onDismiss: () => void;
  onDuplicated: (course: CourseResponse) => void;
}
