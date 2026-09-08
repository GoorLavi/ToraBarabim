import type { DateFilterOption } from './models';
import { CUSTOM_DATE_PARAM, DATE_OPTION_PARAM } from './consts';
import { useHeaderFilterParams } from './useHeaderFilterParams';

export interface DateFilterState {
  option: DateFilterOption;
  customDate: string | undefined;
  selectOption: (option: Exclude<DateFilterOption, 'custom' | 'all'>) => void;
  selectCustomDate: (isoDate: string) => void;
  clearDate: () => void;
}

const DEFAULT_OPTION: DateFilterOption = 'all';

const isDateFilterOption = (value: string | null): value is Exclude<DateFilterOption, 'custom' | 'all'> =>
  value === 'today' || value === 'tomorrow' || value === 'shabbat';

// The header's own date state (client/CLAUDE.md, "Data and State": URL
// state is the source of truth, so a search someone runs is a link they can
// send to a friend). `useHeaderFilterParams` decides whether a change
// applies to the current URL or navigates to `/`.
export const useDateFilter = (): DateFilterState => {
  const { searchParams, applyParams } = useHeaderFilterParams();
  const customDate = searchParams.get(CUSTOM_DATE_PARAM) ?? undefined;
  const optionParam = searchParams.get(DATE_OPTION_PARAM);
  const option: DateFilterOption = customDate ? 'custom' : isDateFilterOption(optionParam) ? optionParam : DEFAULT_OPTION;

  const clearDate = (): void => {
    applyParams((params) => {
      params.delete(DATE_OPTION_PARAM);
      params.delete(CUSTOM_DATE_PARAM);
    });
  };

  // Tapping the already-selected chip clears it and returns to rail mode
  // (explicit, from the human): the chip is a toggle, not a one-way choice.
  const selectOption = (next: Exclude<DateFilterOption, 'custom' | 'all'>): void => {
    if (option === next) {
      clearDate();
      return;
    }

    applyParams((params) => {
      params.delete(CUSTOM_DATE_PARAM);
      params.set(DATE_OPTION_PARAM, next);
    });
  };

  const selectCustomDate = (isoDate: string): void => {
    applyParams((params) => {
      params.delete(DATE_OPTION_PARAM);
      params.set(CUSTOM_DATE_PARAM, isoDate);
    });
  };

  return { option, customDate, selectOption, selectCustomDate, clearDate };
};
