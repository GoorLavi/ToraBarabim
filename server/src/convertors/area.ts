import type { AreaDetailResponse, AreaDirectoryResponse, AreaSummary } from '@torabarabim/common';

import { toCityWithLessonCount } from './city';
import type { AreaDetailResult, AreaDirectoryResult, AreaSummary as AreaSummaryResult } from '../service/area/models';

const toAreaSummary = (record: AreaSummaryResult): AreaSummary => ({ ...record });

export const toAreaDirectoryResponse = (result: AreaDirectoryResult): AreaDirectoryResponse => ({
  areas: result.areas.map(toAreaSummary),
});

export const toAreaDetailResponse = (result: AreaDetailResult): AreaDetailResponse => ({
  area: result.area,
  areaName: result.areaName,
  slug: result.slug,
  cities: result.cities.map(toCityWithLessonCount),
});
