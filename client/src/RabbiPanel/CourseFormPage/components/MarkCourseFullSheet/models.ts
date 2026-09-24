import type { CourseResponse } from '@torabarabim/common';

export interface MarkCourseFullSheetProps {
  courseId: string;
  courseName: string;
  onDismiss: () => void;
  onMarkedFull: (course: CourseResponse) => void;
}
