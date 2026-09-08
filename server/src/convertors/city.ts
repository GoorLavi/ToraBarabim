import type { City, CityAreaGroup, CityDetailResponse, CityDirectoryResponse, CityWithLessonCount } from '@torabarabim/common';

import type {
  CityAreaGroup as CityAreaGroupResult,
  CityDetailResult,
  CityDirectoryResult,
  CityWithLessonCount as CityWithLessonCountResult,
  ResolvedCity,
} from '../service/city/models';

export const toCity = (record: ResolvedCity): City => ({
  id: String(record.code),
  name: record.nameHe,
  area: record.area,
});

export const toCityList = (records: ResolvedCity[]): { items: City[] } => ({
  items: records.map(toCity),
});

const toCityWithLessonCount = (record: CityWithLessonCountResult): CityWithLessonCount => ({
  ...toCity(record),
  lessonCount: record.lessonCount,
});

const toCityAreaGroup = (group: CityAreaGroupResult): CityAreaGroup => ({
  area: group.area,
  areaName: group.areaName,
  cities: group.cities.map(toCityWithLessonCount),
});

export const toCityDirectoryResponse = (result: CityDirectoryResult): CityDirectoryResponse => ({
  areas: result.areas.map(toCityAreaGroup),
});

export const toCityDetailResponse = (result: CityDetailResult): CityDetailResponse => ({
  ...toCity(result),
  rabbis: result.rabbis,
});
