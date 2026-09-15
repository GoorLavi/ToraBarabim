import { useQuery } from '@tanstack/react-query';

import { fetchCitySuggestions } from './api';
import { CITY_PICKER_QUERY_KEYS } from './consts';
import type { CitySuggestionsViewState } from './models';

// Only fetched while the panel is open: the hook is called from
// `CityPickerPanel`, which mounts only then, so there is no request before
// the first interaction.
export const useCitySuggestions = (): CitySuggestionsViewState => {
  const result = useQuery({
    queryKey: CITY_PICKER_QUERY_KEYS.suggestions(),
    queryFn: fetchCitySuggestions,
  });

  if (result.isError) return { kind: 'error', retry: () => void result.refetch() };
  if (!result.data) return { kind: 'loading' };
  if (result.data.areas.length === 0) return { kind: 'empty' };
  return { kind: 'loaded', areas: result.data.areas };
};
