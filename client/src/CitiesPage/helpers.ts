import type { CityAreaGroup } from '@torabarabim/common';

export const cityCountLabel = (count: number): string => (count === 1 ? 'עיר אחת' : `${count} ערים`);

export const totalCityCount = (areas: CityAreaGroup[]): number => areas.reduce((sum, area) => sum + area.cities.length, 0);
