import { useSearchParams } from 'react-router-dom';

import type { DateFilterOption } from '~/HomePage/models';

import { CUSTOM_DATE_PARAM, DATE_OPTION_PARAM } from './consts';

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

// Shared by the home page and /lessons (client/CLAUDE.md, "Data and State":
// URL state is the source of truth, so a search someone runs is a link they
// can send to a friend).
export const useDateFilter = (): DateFilterState => {
  const [searchParams, setSearchParams] = useSearchParams();
  const customDate = searchParams.get(CUSTOM_DATE_PARAM) ?? undefined;
  const optionParam = searchParams.get(DATE_OPTION_PARAM);
  const option: DateFilterOption = customDate ? 'custom' : isDateFilterOption(optionParam) ? optionParam : DEFAULT_OPTION;

  const clearDate = (): void => {
    const params = new URLSearchParams(searchParams);
    params.delete(DATE_OPTION_PARAM);
    params.delete(CUSTOM_DATE_PARAM);
    setSearchParams(params);
  };

  const selectOption = (next: Exclude<DateFilterOption, 'custom' | 'all'>): void => {
    if (option === next) {
      clearDate();
      return;
    }

    const params = new URLSearchParams(searchParams);
    params.delete(CUSTOM_DATE_PARAM);
    params.set(DATE_OPTION_PARAM, next);
    setSearchParams(params);
  };

  const selectCustomDate = (isoDate: string): void => {
    const params = new URLSearchParams(searchParams);
    params.delete(DATE_OPTION_PARAM);
    params.set(CUSTOM_DATE_PARAM, isoDate);
    setSearchParams(params);
  };

  return { option, customDate, selectOption, selectCustomDate, clearDate };
};
