import type { CourseResponse } from '@torabarabim/common';

export interface CloseCourseSheetProps {
  courseId: string;
  courseName: string;
  onDismiss: () => void;
  onClosed: (course: CourseResponse) => void;
}
