import type { AdminCourseStatusFilter } from '../../models';
import type { RabbiFilterValue } from '../../useCourseListFilters';

export interface CourseFilterBarProps {
  className?: string;
  status: AdminCourseStatusFilter;
  onSelectStatus: (status: AdminCourseStatusFilter) => void;
  rabbi: RabbiFilterValue | undefined;
  onSelectRabbi: (rabbi: RabbiFilterValue | undefined) => void;
  search: string;
  onSearchChange: (search: string) => void;
  onClear: () => void;
  activeFilterCount: number;
}
