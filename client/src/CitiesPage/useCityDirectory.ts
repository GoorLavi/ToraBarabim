import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { CityDirectoryResponse } from '@torabarabim/common';

import { fetchCityDirectory, CitiesPageApiError } from './api';
import { CITIES_QUERY_KEYS } from './consts';

export const useCityDirectory = (): UseQueryResult<CityDirectoryResponse, CitiesPageApiError> =>
  useQuery({
    queryKey: CITIES_QUERY_KEYS.directory(),
    queryFn: ({ signal }) => fetchCityDirectory(signal),
  });
