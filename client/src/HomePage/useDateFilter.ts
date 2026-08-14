import { useSearchParams } from 'react-router-dom';

import { CUSTOM_DATE_PARAM, DATE_OPTION_PARAM } from './consts';
import { isDateFilterOption } from './helpers';
import type { DateFilterOption } from './models';

export interface DateFilterState {
  option: DateFilterOption;
  customDate: string | undefined;
  selectOption: (option: Exclude<DateFilterOption, 'custom'>) => void;
  selectCustomDate: (isoDate: string) => void;
}

const DEFAULT_OPTION: DateFilterOption = 'today';

// URL state is the source of truth: the chosen day lives in the query
// string so a search someone runs is a link they can send to a friend.
export const useDateFilter = (): DateFilterState => {
  const [searchParams, setSearchParams] = useSearchParams();
  const customDate = searchParams.get(CUSTOM_DATE_PARAM) ?? undefined;
  const optionParam = searchParams.get(DATE_OPTION_PARAM);
  const option: DateFilterOption = customDate ? 'custom' : isDateFilterOption(optionParam) ? optionParam : DEFAULT_OPTION;

  const selectOption = (next: Exclude<DateFilterOption, 'custom'>): void => {
    const params = new URLSearchParams(searchParams);
    params.delete(CUSTOM_DATE_PARAM);
    if (next === DEFAULT_OPTION) {
      params.delete(DATE_OPTION_PARAM);
    } else {
      params.set(DATE_OPTION_PARAM, next);
    }
    setSearchParams(params);
  };

  const selectCustomDate = (isoDate: string): void => {
    const params = new URLSearchParams(searchParams);
    params.delete(DATE_OPTION_PARAM);
    params.set(CUSTOM_DATE_PARAM, isoDate);
    setSearchParams(params);
  };

  return { option, customDate, selectOption, selectCustomDate };
};
