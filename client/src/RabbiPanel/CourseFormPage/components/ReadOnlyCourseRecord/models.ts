import type { CourseResponse } from '@torabarabim/common';

export interface ReadOnlyCourseRecordProps {
  className?: string;
  course: CourseResponse;
  onOpenDuplicate: () => void;
  onOpenDelete: () => void;
}
