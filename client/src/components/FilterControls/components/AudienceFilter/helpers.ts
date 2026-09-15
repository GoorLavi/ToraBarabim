import type { AudienceFilter, CityDetailResponse } from '@torabarabim/common';

import { CITY_ID_PARAM, CITY_NAME_PARAM, CUSTOM_DATE_PARAM, DATE_OPTION_PARAM, WOMEN_PAGE_PATH } from '~/hooks/consts';

import { ALL_AUDIENCES_LABEL, MIXED_BUTTON_LABEL, OPTION_LABELS } from './consts';
import type { AudienceOption } from './models';

// Carries city and date across to /women, drops the search term and the
// audience param itself (owner default, plan amendments: "leaving /women
// via the dropdown carries city and date back and drops the search text").
// The current page's own city/date params win when present; a city page
// has no city query param of its own, so its route's loader data supplies
// the city instead (section 7: "on /cities/:slug it carries that page's
// city via useRouteLoaderData").
export const womenPagePath = (currentSearch: string, cityRouteData: CityDetailResponse | undefined): string => {
  const params = new URLSearchParams(currentSearch);
  const next = new URLSearchParams();

  const customDate = params.get(CUSTOM_DATE_PARAM);
  const dateOption = params.get(DATE_OPTION_PARAM);
  if (customDate) next.set(CUSTOM_DATE_PARAM, customDate);
  else if (dateOption) next.set(DATE_OPTION_PARAM, dateOption);

  const cityId = params.get(CITY_ID_PARAM);
  const cityName = params.get(CITY_NAME_PARAM);
  if (cityId && cityName) {
    next.set(CITY_ID_PARAM, cityId);
    next.set(CITY_NAME_PARAM, cityName);
  } else if (cityRouteData) {
    next.set(CITY_ID_PARAM, cityRouteData.id);
    next.set(CITY_NAME_PARAM, cityRouteData.name);
  }

  const query = next.toString();
  return query ? `${WOMEN_PAGE_PATH}?${query}` : WOMEN_PAGE_PATH;
};

export const isOptionSelected = (option: AudienceOption, filter: AudienceFilter | undefined, isWomenPage: boolean): boolean => {
  if (isWomenPage) return option === 'women';
  if (option === 'women') return false;
  if (option === 'all') return !filter;
  return option === filter;
};

export const buttonLabel = (filter: AudienceFilter | undefined, isWomenPage: boolean): string => {
  if (isWomenPage) return OPTION_LABELS.women;
  if (filter === 'mixed') return MIXED_BUTTON_LABEL;
  if (filter) return OPTION_LABELS[filter];
  return ALL_AUDIENCES_LABEL;
};
