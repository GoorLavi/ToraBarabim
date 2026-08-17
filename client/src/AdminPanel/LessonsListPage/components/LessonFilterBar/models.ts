import type { SelectedCity } from '~/AdminPanel/components/CitySelect/models';
import type { RecurrenceFilter } from '~/AdminPanel/LessonsListPage/models';

export interface LessonFilterBarProps {
  className?: string;
  city: SelectedCity | undefined;
  onSelectCity: (city: SelectedCity | undefined) => void;
  recurrence: RecurrenceFilter;
  onSelectRecurrence: (recurrence: RecurrenceFilter) => void;
  search: string;
  onSearchChange: (search: string) => void;
  onClear: () => void;
  activeFilterCount: number;
}
