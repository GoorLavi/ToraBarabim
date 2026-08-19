import type { DateFilterOption } from '~/HomePage/models';

export interface DateFilterChipsProps {
  className?: string;
  option: DateFilterOption;
  customDate: string | undefined;
  onSelectOption: (option: Exclude<DateFilterOption, 'custom' | 'all'>) => void;
  onSelectCustomDate: (isoDate: string) => void;
  onClearDate: () => void;
}
