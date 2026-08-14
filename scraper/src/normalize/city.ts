import type { Area, City } from '@torabarabim/common';

import { CITY_DOUBLED_LETTERS, CITY_QUOTE_CHARS, CITY_SUFFIX_SEPARATOR } from './consts';

// Reduces a city name to a comparison key: drop quote characters, drop a
// " - <suffix>" tail, collapse whitespace, and collapse a doubled ו or י to
// one occurrence so full and defective Hebrew spelling compare equal.
const normalizeCityName = (name: string): string =>
  name
    .replace(CITY_QUOTE_CHARS, '')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(CITY_SUFFIX_SEPARATOR, '')
    .trim()
    .replace(CITY_DOUBLED_LETTERS, '$1');

// Groups official cities by their comparison key. A key shared by more than
// one city is ambiguous and is left out of the index: picking either city
// would risk sending someone to the wrong end of the country, which is
// worse than the gap it would replace.
const buildCityIndex = (cities: City[]): Map<string, City> => {
  const groupedByKey = new Map<string, City[]>();
  for (const city of cities) {
    const key = normalizeCityName(city.name);
    const group = groupedByKey.get(key);
    if (group) group.push(city);
    else groupedByKey.set(key, [city]);
  }

  const index = new Map<string, City>();
  for (const [key, group] of groupedByKey) {
    const [onlyCity] = group;
    if (group.length === 1 && onlyCity) index.set(key, onlyCity);
  }
  return index;
};

// Keyed on the cities array's own identity: every lesson in a run is
// resolved against the same array, so the index is built once per run and
// reused, never rebuilt per lesson.
const indexByCitiesList = new WeakMap<City[], Map<string, City>>();

const getCityIndex = (cities: City[]): Map<string, City> => {
  const cached = indexByCitiesList.get(cities);
  if (cached) return cached;

  const index = buildCityIndex(cities);
  indexByCitiesList.set(cities, index);
  return index;
};

// Matches a raw city name against the cities read from the database,
// tolerating the ordinary ways an Israeli writes a city name (see
// normalizeCityName). A name that still does not match, or matches more
// than one official city, is a gap to report, never a guess at the nearest
// city.
export const resolveCity = (cityRaw: string, cities: City[]): { name: string; area: Area } | undefined => {
  const match = getCityIndex(cities).get(normalizeCityName(cityRaw));
  return match ? { name: match.name, area: match.area } : undefined;
};
