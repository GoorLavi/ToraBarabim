import type { SelectedCity } from '~/components/CitySelect/models';
import type { RabbiFilterValue, RecurrenceFilter } from '~/AdminPanel/LessonsListPage/models';

export interface LessonFilterBarProps {
  className?: string;
  city: SelectedCity | undefined;
  onSelectCity: (city: SelectedCity | undefined) => void;
  rabbi: RabbiFilterValue | undefined;
  onClearRabbi: () => void;
  recurrence: RecurrenceFilter;
  onSelectRecurrence: (recurrence: RecurrenceFilter) => void;
  search: string;
  onSearchChange: (search: string) => void;
  onClear: () => void;
  activeFilterCount: number;
}
