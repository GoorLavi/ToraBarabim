import type {
  City,
  CityAreaGroup,
  CityAreaSuggestionGroup,
  CityDetailResponse,
  CityDirectoryResponse,
  CitySearchResult,
  CitySuggestionsResponse,
  CityWithLessonCount,
} from '@torabarabim/common';

import type {
  CityAreaGroup as CityAreaGroupResult,
  CityAreaSuggestionGroup as CityAreaSuggestionGroupResult,
  CityDetailResult,
  CityDirectoryResult,
  CitySearchResult as CitySearchResultRecord,
  CitySuggestionsResult,
  CityWithLessonCount as CityWithLessonCountResult,
  ResolvedCity,
} from '../service/city/models';

export const toCity = (record: ResolvedCity): City => ({
  id: String(record.code),
  name: record.nameHe,
  slug: record.slug,
  area: record.area,
});

export const toCitySearchResult = (record: CitySearchResultRecord): CitySearchResult => ({
  ...toCity(record),
  areaName: record.areaName,
  lessonCount: record.lessonCount,
});

export const toCityList = (records: CitySearchResultRecord[]): { items: CitySearchResult[] } => ({
  items: records.map(toCitySearchResult),
});

export const toCityWithLessonCount = (record: CityWithLessonCountResult): CityWithLessonCount => ({
  ...toCity(record),
  lessonCount: record.lessonCount,
});

const toCityAreaGroup = (group: CityAreaGroupResult): CityAreaGroup => ({
  area: group.area,
  areaName: group.areaName,
  slug: group.slug,
  cities: group.cities.map(toCityWithLessonCount),
});

export const toCityDirectoryResponse = (result: CityDirectoryResult): CityDirectoryResponse => ({
  areas: result.areas.map(toCityAreaGroup),
});

const toCityAreaSuggestionGroup = (group: CityAreaSuggestionGroupResult): CityAreaSuggestionGroup => ({
  ...toCityAreaGroup(group),
  areaLessonCount: group.areaLessonCount,
});

export const toCitySuggestionsResponse = (result: CitySuggestionsResult): CitySuggestionsResponse => ({
  areas: result.areas.map(toCityAreaSuggestionGroup),
});

export const toCityDetailResponse = (result: CityDetailResult): CityDetailResponse => ({
  ...toCity(result),
  areaName: result.areaName,
  areaSlug: result.areaSlug,
  rabbis: result.rabbis,
});
