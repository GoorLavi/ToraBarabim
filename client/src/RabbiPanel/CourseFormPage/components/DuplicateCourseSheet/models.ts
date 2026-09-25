import type { CourseResponse } from '@torabarabim/common';

export interface DuplicateCourseSheetProps {
  courseId: string;
  courseName: string;
  // The source course's own cycle, prefilled by the shared sheet as one
  // higher: empty when the source has none.
  sourceCycle: number | undefined;
  onDismiss: () => void;
  onDuplicated: (course: CourseResponse) => void;
}
