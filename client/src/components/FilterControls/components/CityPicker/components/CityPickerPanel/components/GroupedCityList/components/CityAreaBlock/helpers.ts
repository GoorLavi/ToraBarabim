import type { CityWithLessonCount } from '@torabarabim/common';

import { MAX_VISIBLE_CITIES, MIN_HIDDEN_CITIES_TO_EXPAND } from './consts';

const hiddenCount = (totalCities: number): number => {
  const hidden = totalCities - MAX_VISIBLE_CITIES;
  return hidden < MIN_HIDDEN_CITIES_TO_EXPAND ? 0 : hidden;
};

export const visibleCities = (cities: CityWithLessonCount[], isExpanded: boolean): CityWithLessonCount[] =>
  isExpanded || hiddenCount(cities.length) === 0 ? cities : cities.slice(0, MAX_VISIBLE_CITIES);

export const hiddenCityCount = (cities: CityWithLessonCount[]): number => hiddenCount(cities.length);
