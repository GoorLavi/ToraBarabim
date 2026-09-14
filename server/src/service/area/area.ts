import { AREAS } from '../../db/schema/enums';
import { AREA_NAMES_HE } from '../shared/consts';
import { toSlug } from '../shared/slug';
import * as cityService from '../city/city';
import { AreaNotFoundError } from './errors';
import type { AreaDetailResult, AreaDirectoryResult, AreaSummary } from './models';

// `area` is only one field on `cities`; the city directory already loads
// every city and every lesson's city code once and joins them in memory, so
// the area directory reuses that result instead of running the same join
// again to group by area.
export const listDirectory = async (): Promise<AreaDirectoryResult> => {
  const cityDirectory = await cityService.listDirectory();

  const areas: AreaSummary[] = cityDirectory.areas.map((group) => ({
    area: group.area,
    areaName: group.areaName,
    slug: toSlug(group.areaName),
    cityCount: group.cities.length,
    lessonCount: group.cities.reduce((total, city) => total + city.lessonCount, 0),
  }));

  return { areas };
};

export const resolveBySlug = async (slug: string): Promise<AreaDetailResult> => {
  const area = AREAS.find((candidate) => toSlug(AREA_NAMES_HE[candidate]) === slug);
  if (!area) {
    throw new AreaNotFoundError(slug);
  }

  const cityDirectory = await cityService.listDirectory();
  const group = cityDirectory.areas.find((candidate) => candidate.area === area);

  return {
    area,
    areaName: AREA_NAMES_HE[area],
    slug,
    // A real area with no city that currently has a lesson is a normal
    // empty result, not a 404: the area itself still resolved.
    cities: group?.cities ?? [],
  };
};
