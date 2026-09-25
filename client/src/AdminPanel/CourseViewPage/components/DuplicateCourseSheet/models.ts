import type { CourseResponse } from '@torabarabim/common';

export interface DuplicateCourseSheetProps {
  courseId: string;
  courseName: string;
  sourceCycle: number | undefined;
  onDismiss: () => void;
  onDuplicated: (course: CourseResponse) => void;
}
