import type { SelectedCity } from './models';
import { CITY_ID_PARAM, CITY_NAME_PARAM } from './consts';
import { useHeaderFilterParams } from './useHeaderFilterParams';

export interface SelectedCityState {
  city: SelectedCity | undefined;
  select: (city: SelectedCity) => void;
  clear: () => void;
}

// `city.id` is the numeric city code (05-lessons.md, "Data"), which is
// exactly what CityPicker already returns. `useHeaderFilterParams` decides
// whether a change applies to the current URL or navigates to `/`.
export const useSelectedCity = (): SelectedCityState => {
  const { searchParams, applyParams } = useHeaderFilterParams();
  const cityId = searchParams.get(CITY_ID_PARAM);
  const cityName = searchParams.get(CITY_NAME_PARAM);

  const select = (city: SelectedCity): void => {
    applyParams((params) => {
      params.set(CITY_ID_PARAM, city.id);
      params.set(CITY_NAME_PARAM, city.name);
    });
  };

  // Tapping the selected city pill clears it and returns to "all areas"
  // (explicit, from the human, the same toggle as the date chips).
  const clear = (): void => {
    applyParams((params) => {
      params.delete(CITY_ID_PARAM);
      params.delete(CITY_NAME_PARAM);
    });
  };

  if (cityId && cityName) {
    return { city: { id: cityId, name: cityName }, select, clear };
  }

  return { city: undefined, select, clear };
};
