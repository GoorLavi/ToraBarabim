import { useSearchParams } from 'react-router-dom';

import { CITY_ID_PARAM, CITY_NAME_PARAM } from './consts';
import type { SelectedCity } from './models';

export interface SelectedCityState {
  city: SelectedCity | undefined;
  select: (city: SelectedCity) => void;
}

// No geolocation and no assumed home city (design-system.md, "No default
// city"): a first-time visitor with nothing in the URL sees lessons across
// all areas, and only narrows once they pick a city here.
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

  if (cityId && cityName) {
    return { city: { id: cityId, name: cityName }, select };
  }

  return { city: undefined, select };
};
