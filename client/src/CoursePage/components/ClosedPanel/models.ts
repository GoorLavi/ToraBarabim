import type { CourseTeacher } from '@torabarabim/common';

export interface ClosedPanelProps {
  className?: string;
  reason: 'closed' | 'full';
  openingDate: string;
  weeks: number;
  teacher: CourseTeacher;
}
