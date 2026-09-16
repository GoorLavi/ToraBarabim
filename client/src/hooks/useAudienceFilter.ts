import type { AudienceFilter } from '@torabarabim/common';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { AUDIENCE_PARAM, CITY_ID_PARAM, CITY_NAME_PARAM, CUSTOM_DATE_PARAM, DATE_OPTION_PARAM } from './consts';
import { isAudienceFilterValue, isWomenPagePath } from './helpers';
import type { AudienceFilterState } from './models';

// Distinct from useDateFilter, useSelectedCity and useSearchQuery: those
// three act in place on both `/` and `/women` (useHeaderFilterParams), but
// audience never does on `/women`, since the values it offers there
// (הכל / גברים / גם גברים וגם נשים) mean "leave the women's area", not "narrow
// it". Choosing one of them from `/women` carries the header's own city and
// date across to `/`, the same way נשים carries them the other way
// (AudienceFilter/helpers.ts, womenPagePath), and drops the search term.
// Everywhere else the existing launch-pad rule holds: navigate to `/`
// carrying only the audience.
export const useAudienceFilter = (): AudienceFilterState => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isHome = location.pathname === '/';
  const value = isHome ? searchParams.get(AUDIENCE_PARAM) : null;
  const filter = isAudienceFilterValue(value) ? value : undefined;

  const navigateFromWomen = (build: (params: URLSearchParams) => void): void => {
    const current = new URLSearchParams(location.search);
    const next = new URLSearchParams();
    for (const param of [DATE_OPTION_PARAM, CUSTOM_DATE_PARAM, CITY_ID_PARAM, CITY_NAME_PARAM]) {
      const carried = current.get(param);
      if (carried) next.set(param, carried);
    }
    build(next);
    navigate({ pathname: '/', search: next.toString() });
  };

  const navigateElsewhere = (build: (params: URLSearchParams) => void): void => {
    const next = new URLSearchParams();
    build(next);
    navigate({ pathname: '/', search: next.toString() });
  };

  const clearFilter = (): void => {
    if (isHome) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete(AUDIENCE_PARAM);
          return next;
        },
        { replace: true },
      );
      return;
    }

    const build = (params: URLSearchParams): void => {
      params.delete(AUDIENCE_PARAM);
    };
    if (isWomenPagePath(location.pathname)) navigateFromWomen(build);
    else navigateElsewhere(build);
  };

  const selectFilter = (next: AudienceFilter): void => {
    if (isHome) {
      if (filter === next) {
        clearFilter();
        return;
      }
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        params.set(AUDIENCE_PARAM, next);
        return params;
      });
      return;
    }

    const build = (params: URLSearchParams): void => {
      params.set(AUDIENCE_PARAM, next);
    };
    if (isWomenPagePath(location.pathname)) navigateFromWomen(build);
    else navigateElsewhere(build);
  };

  return { filter, selectFilter, clearFilter };
};
