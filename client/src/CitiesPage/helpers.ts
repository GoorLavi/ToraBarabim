import type { CityAreaGroup } from '@torabarabim/common';

export const totalCityCount = (areas: CityAreaGroup[]): number => areas.reduce((sum, area) => sum + area.cities.length, 0);
