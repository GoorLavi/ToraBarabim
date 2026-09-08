import { useSearchParams } from 'react-router-dom';

import type { SelectedCity } from '~/HomePage/models';

import { CITY_ID_PARAM, CITY_NAME_PARAM } from './consts';

export interface SelectedCityState {
  city: SelectedCity | undefined;
  select: (city: SelectedCity) => void;
  clear: () => void;
}

// Shared by the home page and /lessons. `city.id` is the numeric city code
// (05-lessons.md, "Data"), which is exactly what CityPicker already
// returns.
export const useSelectedCity = (): SelectedCityState => {
  const [searchParams, setSearchParams] = useSearchParams();
  const cityId = searchParams.get(CITY_ID_PARAM);
  const cityName = searchParams.get(CITY_NAME_PARAM);

  const select = (city: SelectedCity): void => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set(CITY_ID_PARAM, city.id);
      next.set(CITY_NAME_PARAM, city.name);
      return next;
    });
  };

  const clear = (): void => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete(CITY_ID_PARAM);
      next.delete(CITY_NAME_PARAM);
      return next;
    });
  };

  if (cityId && cityName) {
    return { city: { id: cityId, name: cityName }, select, clear };
  }

  return { city: undefined, select, clear };
};
