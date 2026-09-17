import type { RabbiHonorific } from '@torabarabim/common';
import { useSearchParams } from 'react-router-dom';

import type { SelectedCity } from '~/components/CitySelect/models';

import * as consts from './consts';
import type { LessonListUrlFilters, RecurrenceFilter } from './models';

export interface LessonListFiltersState extends LessonListUrlFilters {
  selectCity: (city: SelectedCity | undefined) => void;
  selectRecurrence: (recurrence: RecurrenceFilter) => void;
  setSearch: (search: string) => void;
  clearRabbi: () => void;
  clear: () => void;
  activeFilterCount: number;
}

const isRecurrenceFilter = (value: string | null): value is RecurrenceFilter => value === 'weekly' || value === 'once';
const isRabbiHonorific = (value: string | null): value is RabbiHonorific => value === 'rav' || value === 'rabbanit';

// A search someone can share lives in the URL, not in component state
// (client/CLAUDE.md, Data and State): every filter on this screen is a
// query param.
export const useLessonListFilters = (): LessonListFiltersState => {
  const [searchParams, setSearchParams] = useSearchParams();

  const cityId = searchParams.get(consts.CITY_ID_PARAM);
  const cityName = searchParams.get(consts.CITY_NAME_PARAM);
  const city = cityId && cityName ? { id: cityId, name: cityName } : undefined;

  const rabbiId = searchParams.get(consts.RABBI_ID_PARAM);
  const rabbiName = searchParams.get(consts.RABBI_NAME_PARAM);
  const rabbiHonorificParam = searchParams.get(consts.RABBI_HONORIFIC_PARAM);
  const rabbi =
    rabbiId && rabbiName && isRabbiHonorific(rabbiHonorificParam) ? { id: rabbiId, name: rabbiName, honorific: rabbiHonorificParam } : undefined;

  const recurrenceParam = searchParams.get(consts.RECURRENCE_PARAM);
  const recurrence: RecurrenceFilter = isRecurrenceFilter(recurrenceParam) ? recurrenceParam : 'all';
  const search = searchParams.get(consts.SEARCH_PARAM) ?? '';

  const selectCity = (nextCity: SelectedCity | undefined): void => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (nextCity) {
        next.set(consts.CITY_ID_PARAM, nextCity.id);
        next.set(consts.CITY_NAME_PARAM, nextCity.name);
      } else {
        next.delete(consts.CITY_ID_PARAM);
        next.delete(consts.CITY_NAME_PARAM);
      }
      return next;
    });
  };

  const selectRecurrence = (nextRecurrence: RecurrenceFilter): void => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (nextRecurrence === 'all') next.delete(consts.RECURRENCE_PARAM);
      else next.set(consts.RECURRENCE_PARAM, nextRecurrence);
      return next;
    });
  };

  const setSearch = (nextSearch: string): void => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (nextSearch) next.set(consts.SEARCH_PARAM, nextSearch);
      else next.delete(consts.SEARCH_PARAM);
      return next;
    });
  };

  const clearRabbi = (): void => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete(consts.RABBI_ID_PARAM);
      next.delete(consts.RABBI_NAME_PARAM);
      next.delete(consts.RABBI_HONORIFIC_PARAM);
      return next;
    });
  };

  const clear = (): void => setSearchParams(new URLSearchParams());

  const activeFilterCount = [Boolean(city), Boolean(rabbi), recurrence !== 'all', Boolean(search)].filter(Boolean).length;

  return { city, rabbi, recurrence, search, selectCity, selectRecurrence, setSearch, clearRabbi, clear, activeFilterCount };
};
